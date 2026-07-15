import {
  runCustomerServiceAgent,
  type AgentPet,
  type AgentService,
  type AgentToolRegistry,
  type AgentToolTrace,
  type AvailableTimeSlot,
  type BookingDraft,
  type CustomerServiceAgentConfig,
  type CustomerServiceConversationMessage
} from "@petcare/agent";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BookingStatus, PetType, Prisma, SizeType } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { StatsService } from "../stats/stats.service";
import { BusinessAssistantDto, CustomerServiceChatDto, MarketingCopyDto } from "./dto";

const TIME_SLOTS = [
  { label: "09:00 - 10:30", start: "09:00", end: "10:30" },
  { label: "10:30 - 12:00", start: "10:30", end: "12:00" },
  { label: "12:00 - 13:30", start: "12:00", end: "13:30" },
  { label: "13:30 - 15:00", start: "13:30", end: "15:00" },
  { label: "15:00 - 16:30", start: "15:00", end: "16:30" },
  { label: "16:30 - 18:00", start: "16:30", end: "18:00" }
];

interface CustomerServiceResult {
  mode: "LLM" | "RULE_FALLBACK";
  answer: string;
  services: AgentService[];
  availableSlots: AvailableTimeSlot[];
  bookingDraft?: BookingDraft;
  toolCalls: AgentToolTrace[];
}

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly statsService: StatsService
  ) {}

  async customerService(input: CustomerServiceChatDto) {
    const message = input.message.trim();

    if (!message) {
      throw new BadRequestException("请输入咨询内容");
    }

    const history = await this.getConversationHistory(input.userId);
    const agentConfig = this.getCustomerServiceAgentConfig();
    let result: CustomerServiceResult;

    if (agentConfig) {
      try {
        const agentResult = await runCustomerServiceAgent(
          agentConfig,
          this.createAgentToolRegistry(),
          { userId: input.userId, channel: "miniapp" },
          [...history, { role: "user", content: message }]
        );
        const services = [...agentResult.services];
        if (agentResult.bookingDraft && !services.some((service) => service.id === agentResult.bookingDraft?.serviceId)) {
          const draftService = await this.prisma.service.findUnique({ where: { id: agentResult.bookingDraft.serviceId } });
          if (draftService) {
            services.push(this.toAgentService(draftService));
          }
        }
        result = {
          mode: "LLM",
          answer: agentResult.answer,
          services,
          availableSlots: agentResult.availableSlots,
          bookingDraft: agentResult.bookingDraft,
          toolCalls: agentResult.toolCalls
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "未知错误";
        console.warn(`AI 客服调用失败，已切换规则回答：${reason}`);
        result = await this.runRuleCustomerService(message, input.userId);
      }
    } else {
      result = await this.runRuleCustomerService(message, input.userId);
    }

    await this.saveCustomerConversation(input.userId, message, result.answer, result.mode, result.toolCalls);

    return serializeEntity({
      answer: result.answer,
      mode: result.mode,
      services: result.services,
      availableSlots: result.availableSlots,
      bookingDraft: result.bookingDraft
    });
  }

  async businessAssistant(input: BusinessAssistantDto) {
    const message = input.message.trim();
    const data = await this.statsService.businessData();
    const answer = this.composeBusinessAnswer(message, data);

    await this.prisma.aiConversation.create({
      data: {
        channel: "admin",
        role: "assistant",
        content: answer,
        toolCalls: data
      }
    });

    return serializeEntity({ answer, data });
  }

  async marketingCopy(input: MarketingCopyDto) {
    const [services, availableSlots, businessData] = await Promise.all([
      this.prisma.service.findMany({
        where: { enabled: true },
        orderBy: { basePrice: "asc" },
        take: 5
      }),
      this.getAvailableSlots(this.resolveDate("明天")),
      this.statsService.businessData()
    ]);
    const channel = input.channel || "朋友圈";
    const tone = input.tone || "亲切";
    const topic = input.topic.trim();
    const leadService = businessData.popularServices[0] ?? services[0];
    const serviceLine = services.map((service) => `${service.name} ¥${service.basePrice.toString()}`).join("、");
    const idleLine = availableSlots.length
      ? `明日仍有 ${availableSlots.slice(0, 3).map((slot) => `${slot.startTime}-${slot.endTime}`).join("、")} 可约。`
      : "明日预约较满，可引导客户提前锁定后续档期。";
    const copy = [
      `【${topic}】`,
      channel === "小红书"
        ? `宠物洗护小提醒来啦：${leadService?.name ?? "门店热门服务"} 最近很受欢迎，适合想让毛孩子清爽出门的家长。`
        : `宠伴管家本周给老朋友准备了${topic}，让宝贝舒服，也让家长更省心。`,
      `可选服务：${serviceLine}。${idleLine}`,
      tone === "活泼" ? "带上毛孩子来放松一下吧，干净蓬松的快乐安排上！" : "如需预约，请直接联系门店或在小程序选择合适时间。",
      "名额按预约顺序保留，特殊体质或害怕吹风的宠物请提前备注。"
    ].join("\n");

    await this.prisma.aiConversation.create({
      data: {
        channel: "admin",
        role: "assistant",
        content: copy,
        toolCalls: {
          topic,
          channel,
          tone,
          services: services.map((service) => service.id),
          availableSlots
        }
      }
    });

    return serializeEntity({
      copy,
      channel,
      tone,
      services,
      availableSlots
    });
  }

  private getCustomerServiceAgentConfig(): CustomerServiceAgentConfig | null {
    const enabled = ["1", "true", "yes"].includes((this.config.get<string>("AI_ENABLED") ?? "").toLowerCase());
    const apiKey = this.config.get<string>("AI_API_KEY")?.trim();
    const baseURL = this.config.get<string>("AI_BASE_URL")?.trim();
    const model = this.config.get<string>("AI_MODEL")?.trim();

    if (!enabled || !apiKey || !baseURL || !model) {
      return null;
    }

    return { apiKey, baseURL: baseURL.replace(/\/$/, ""), model, timeoutMs: 15_000 };
  }

  private async getConversationHistory(userId?: string): Promise<CustomerServiceConversationMessage[]> {
    if (!userId) {
      return [];
    }

    const records = await this.prisma.aiConversation.findMany({
      where: {
        userId,
        channel: "miniapp",
        role: { in: ["user", "assistant"] }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { role: true, content: true }
    });

    return records
      .reverse()
      .filter((record): record is { role: "user" | "assistant"; content: string } =>
        record.role === "user" || record.role === "assistant"
      )
      .map((record) => ({ role: record.role, content: record.content }));
  }

  private createAgentToolRegistry(): AgentToolRegistry {
    return {
      queryKnowledgeBase: async ({ query }) => {
        const items = await this.findKnowledge(query);
        return items.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category
        }));
      },
      getServiceList: async (input) => {
        const where: Prisma.ServiceWhereInput = {
          enabled: true,
          petType: input.petType as PetType | undefined,
          sizeType: input.sizeType as SizeType | undefined
        };

        if (input.query?.trim()) {
          const query = input.query.trim();
          where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ];
        }

        const services = await this.prisma.service.findMany({ where, orderBy: { basePrice: "asc" } });
        return services.map((service) => this.toAgentService(service));
      },
      getServicePrice: async ({ serviceId, serviceName }) => {
        const services = await this.prisma.service.findMany({
          where: {
            enabled: true,
            ...(serviceId ? { id: serviceId } : {}),
            ...(serviceName ? { name: { contains: serviceName, mode: "insensitive" } } : {})
          },
          orderBy: { basePrice: "asc" },
          take: 5
        });
        return services.map((service) => this.toAgentService(service));
      },
      getAvailableTimeSlots: async ({ date, serviceId }) => {
        this.assertDateKey(date);
        if (serviceId) {
          const service = await this.prisma.service.findFirst({ where: { id: serviceId, enabled: true }, select: { id: true } });
          if (!service) {
            throw new BadRequestException("服务项目不存在或已停用");
          }
        }
        return this.getAvailableSlots(date);
      },
      getCustomerPets: async (context) => {
        if (!context.userId) {
          return [];
        }
        const pets = await this.prisma.pet.findMany({ where: { userId: context.userId }, orderBy: { createdAt: "asc" } });
        return pets.map((pet): AgentPet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          notes: pet.notes
        }));
      },
      createBookingDraft: (draft, context) => this.validateBookingDraft(draft, context.userId)
    };
  }

  private async runRuleCustomerService(message: string, userId?: string): Promise<CustomerServiceResult> {
    const targetDate = this.resolveDate(message);
    const [services, knowledge, availableSlots] = await Promise.all([
      this.prisma.service.findMany({
        where: { enabled: true },
        orderBy: { basePrice: "asc" }
      }),
      this.findKnowledge(message),
      this.getAvailableSlots(targetDate)
    ]);
    const bookingDraft = await this.createRuleBookingDraft(message, userId, services);
    const matchedServices = this.matchServices(message, services);
    const displayServices = matchedServices.length > 0 ? matchedServices : services.slice(0, 3);
    const answer = [
      this.composeCustomerAnswer(message, services, knowledge, availableSlots),
      bookingDraft ? "我已经整理好预约草案，请核对宠物、服务和时间后再提交。" : ""
    ]
      .filter(Boolean)
      .join("\n");

    return {
      mode: "RULE_FALLBACK",
      answer,
      services: displayServices.map((service) => this.toAgentService(service)),
      availableSlots,
      bookingDraft,
      toolCalls: [
        {
          name: "ruleFallback",
          input: { message, targetDate },
          output: {
            serviceIds: services.map((service) => service.id),
            knowledgeIds: knowledge.map((item) => item.id),
            availableSlots,
            bookingDraft
          }
        }
      ]
    };
  }

  private async saveCustomerConversation(
    userId: string | undefined,
    message: string,
    answer: string,
    mode: CustomerServiceResult["mode"],
    toolCalls: AgentToolTrace[]
  ) {
    await this.prisma.$transaction([
      this.prisma.aiConversation.create({
        data: { userId, channel: "miniapp", role: "user", content: message }
      }),
      this.prisma.aiConversation.create({
        data: {
          userId,
          channel: "miniapp",
          role: "assistant",
          content: answer,
          toolCalls: { mode, calls: toolCalls } as unknown as Prisma.InputJsonValue
        }
      })
    ]);
  }

  private async validateBookingDraft(draft: BookingDraft, userId?: string) {
    const errors: string[] = [];

    if (!userId) {
      return { valid: false, errors: ["请先登录后再生成预约草案"] };
    }

    this.assertDateKey(draft.bookingDate);
    const slot = TIME_SLOTS.find((item) => item.start === draft.startTime && item.end === draft.endTime);
    if (!slot) {
      errors.push("请选择门店提供的固定预约时间段");
    }

    const [pet, service] = await Promise.all([
      this.prisma.pet.findUnique({ where: { id: draft.petId } }),
      this.prisma.service.findUnique({ where: { id: draft.serviceId } })
    ]);

    if (!pet || pet.userId !== userId) {
      errors.push("宠物不属于当前客户");
    }
    if (!service || !service.enabled) {
      errors.push("服务项目不存在或已停用");
    }
    if (pet && service && service.petType !== PetType.OTHER && service.petType !== pet.type) {
      errors.push("该服务不适用于所选宠物类型");
    }

    const startTime = this.parseShanghaiDateTime(draft.bookingDate, draft.startTime);
    if (startTime <= new Date()) {
      errors.push("预约时间必须晚于当前时间");
    }

    if (slot) {
      const availableSlots = await this.getAvailableSlots(draft.bookingDate);
      if (!availableSlots.some((item) => item.startTime === draft.startTime && item.endTime === draft.endTime)) {
        errors.push("所选时间段已被预约");
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      draft: {
        petId: draft.petId,
        serviceId: draft.serviceId,
        bookingDate: draft.bookingDate,
        startTime: draft.startTime,
        endTime: draft.endTime,
        remark: draft.remark?.trim() || undefined
      }
    };
  }

  private async createRuleBookingDraft(
    message: string,
    userId: string | undefined,
    services: Awaited<ReturnType<PrismaService["service"]["findMany"]>>
  ): Promise<BookingDraft | undefined> {
    if (!userId || !/预约|约一下|帮.*约/.test(message)) {
      return undefined;
    }

    const [pets, startTime] = await Promise.all([
      this.prisma.pet.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      Promise.resolve(this.extractRequestedTime(message))
    ]);
    const pet = pets.find((item) => message.includes(item.name));
    const service = this.matchServices(message, services)[0];
    const slot = TIME_SLOTS.find((item) => item.start === startTime);

    if (!pet || !service || !slot) {
      return undefined;
    }

    const result = await this.validateBookingDraft(
      {
        petId: pet.id,
        serviceId: service.id,
        bookingDate: this.resolveDate(message),
        startTime: slot.start,
        endTime: slot.end,
        remark: pet.notes ?? undefined
      },
      userId
    );
    return result.valid ? result.draft : undefined;
  }

  private toAgentService(service: {
    id: string;
    name: string;
    category: string;
    petType: PetType;
    sizeType: SizeType;
    basePrice: { toNumber(): number };
    durationMinutes: number;
    description: string | null;
    notice: string | null;
  }): AgentService {
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      petType: service.petType,
      sizeType: service.sizeType,
      basePrice: service.basePrice.toNumber(),
      durationMinutes: service.durationMinutes,
      description: service.description,
      notice: service.notice
    };
  }

  private async findKnowledge(message: string) {
    const keywords = this.extractKeywords(message);

    if (keywords.length === 0) {
      return this.prisma.knowledgeBase.findMany({
        where: { enabled: true },
        take: 3,
        orderBy: { createdAt: "desc" }
      });
    }

    return this.prisma.knowledgeBase.findMany({
      where: {
        enabled: true,
        OR: keywords.flatMap((keyword) => [
          { title: { contains: keyword, mode: "insensitive" as const } },
          { content: { contains: keyword, mode: "insensitive" as const } },
          { category: { contains: keyword, mode: "insensitive" as const } }
        ])
      },
      take: 3,
      orderBy: { createdAt: "desc" }
    });
  }

  private async getAvailableSlots(date: string) {
    const booked = await this.prisma.booking.findMany({
      where: {
        bookingDate: this.parseDateOnly(date),
        status: { not: BookingStatus.CANCELLED }
      },
      select: { startTime: true }
    });
    const occupied = new Set(booked.map((booking) => this.formatShanghaiTime(booking.startTime)));

    return TIME_SLOTS.filter(
      (slot) => !occupied.has(slot.start) && this.parseShanghaiDateTime(date, slot.start) > new Date()
    ).map((slot) => ({
      date,
      startTime: slot.start,
      endTime: slot.end
    }));
  }

  private composeCustomerAnswer(
    message: string,
    services: Awaited<ReturnType<PrismaService["service"]["findMany"]>>,
    knowledge: Awaited<ReturnType<PrismaService["knowledgeBase"]["findMany"]>>,
    availableSlots: Array<{ date: string; startTime: string; endTime: string }>
  ) {
    const wantsNotice = /注意|害怕|吹风|准备|第一次|规则|notice|rule/i.test(message);
    const matchedServices = this.matchServices(message, services);
    const targetServices = matchedServices.length > 0 ? matchedServices : services.slice(0, 4);
    const lines = [
      `目前可预约的服务有：${targetServices
        .map((service) => `${service.name} ¥${service.basePrice.toString()}，约 ${service.durationMinutes} 分钟`)
        .join("；")}。`,
      availableSlots.length > 0
        ? `可选时间段：${availableSlots.map((slot) => `${slot.date} ${slot.startTime}-${slot.endTime}`).join("、")}。`
        : "这一天暂时没有可约时间段，可能已经约满或营业时间已过，建议换一天或联系门店人工确认。"
    ];

    if (wantsNotice && knowledge.length > 0) {
      lines.push(`注意事项：${knowledge.map((item) => item.content).join(" ")}`);
    }

    lines.push("如需临时加急、改约或宠物有特殊情况，建议转人工由门店确认。");
    return lines.join("\n");
  }

  private composeBusinessAnswer(message: string, data: Awaited<ReturnType<StatsService["businessData"]>>) {
    const popular = data.popularServices.length
      ? data.popularServices.map((service) => `${service.name} ${service.bookingCount} 次`).join("、")
      : "暂无服务预约数据";
    const advice =
      data.pendingBookings > 0
        ? `当前还有 ${data.pendingBookings} 个待确认预约，建议优先处理，减少客户等待。`
        : "当前没有待确认预约，可以把重点放在会员复购和空闲时段促销上。";

    return [
      `根据「${message}」的经营数据汇总：`,
      `今日收入 ¥${data.todayRevenue.toFixed(2)}，今日预约 ${data.todayBookings} 个。`,
      `本月收入 ¥${data.monthRevenue.toFixed(2)}，本月预约 ${data.monthBookings} 个，会员消费/核销 ¥${data.memberConsumption.toFixed(2)}。`,
      `当前客户数 ${data.customers}，本月复购率 ${data.repeatRate.toFixed(1)}%，60 天未消费客户 ${data.inactiveCustomerCount} 位。`,
      `热门服务：${popular}。`,
      advice
    ].join("\n");
  }

  private matchServices(message: string, services: Awaited<ReturnType<PrismaService["service"]["findMany"]>>) {
    const nameMatches = services.filter((service) => message.includes(service.name));
    if (nameMatches.length > 0) {
      return nameMatches;
    }

    const categoryMatches = services.filter((service) => message.includes(service.category));
    if (categoryMatches.length > 0) {
      return categoryMatches;
    }

    return services.filter((service) => {
      const petKeyword = service.petType === PetType.CAT ? "猫" : service.petType === PetType.DOG ? "狗" : "宠物";
      return message.includes(petKeyword) || message.toLowerCase().includes(service.petType.toLowerCase());
    });
  }

  private extractKeywords(message: string) {
    return ["预约", "规则", "注意", "吹风", "洗护", "美容", "寄养", "价格", "套餐卡", "优惠券", "活动"].filter(
      (keyword) => message.includes(keyword)
    );
  }

  private resolveDate(message: string) {
    const now = new Date();
    const offset = /明天|tomorrow/i.test(message) ? 1 : 0;
    const shanghai = new Date(now.getTime() + 8 * 60 * 60 * 1000 + offset * 24 * 60 * 60 * 1000);
    return shanghai.toISOString().slice(0, 10);
  }

  private parseDateOnly(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private assertDateKey(date: string) {
    const parsed = this.parseDateOnly(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new BadRequestException("日期必须使用 YYYY-MM-DD 格式");
    }
  }

  private parseShanghaiDateTime(date: string, time: string) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0));
  }

  private extractRequestedTime(message: string) {
    const clockTime = message.match(/(?:^|\D)([01]?\d|2[0-3]):([0-5]\d)(?:\D|$)/);
    if (clockTime) {
      return `${clockTime[1].padStart(2, "0")}:${clockTime[2]}`;
    }

    const chineseTime = message.match(/(上午|中午|下午|晚上)?\s*(\d{1,2})\s*点(半)?/);
    if (!chineseTime) {
      return undefined;
    }

    const period = chineseTime[1];
    let hour = Number(chineseTime[2]);
    if ((period === "下午" || period === "晚上") && hour < 12) {
      hour += 12;
    }
    if (period === "中午" && hour < 11) {
      hour += 12;
    }
    const minute = chineseTime[3] ? "30" : "00";
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  private formatShanghaiTime(value: Date) {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(value);
  }

}
