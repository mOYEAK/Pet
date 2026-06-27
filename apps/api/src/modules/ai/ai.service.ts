import { Injectable } from "@nestjs/common";
import { BookingStatus, OrderStatus, UserRole } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessAssistantDto, CustomerServiceChatDto, MarketingCopyDto } from "./dto";

const TIME_SLOTS = [
  { label: "09:00 - 10:30", start: "09:00", end: "10:30" },
  { label: "10:30 - 12:00", start: "10:30", end: "12:00" },
  { label: "12:00 - 13:30", start: "12:00", end: "13:30" },
  { label: "13:30 - 15:00", start: "13:30", end: "15:00" },
  { label: "15:00 - 16:30", start: "15:00", end: "16:30" },
  { label: "16:30 - 18:00", start: "16:30", end: "18:00" }
];

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async customerService(input: CustomerServiceChatDto) {
    const message = input.message.trim();
    const targetDate = this.resolveDate(message);
    const [services, knowledge, availableSlots] = await Promise.all([
      this.prisma.service.findMany({
        where: { enabled: true },
        orderBy: { basePrice: "asc" }
      }),
      this.findKnowledge(message),
      this.getAvailableSlots(targetDate)
    ]);
    const answer = this.composeCustomerAnswer(message, services, knowledge, availableSlots);

    await this.prisma.$transaction([
      this.prisma.aiConversation.create({
        data: {
          userId: input.userId,
          channel: "miniapp",
          role: "user",
          content: message
        }
      }),
      this.prisma.aiConversation.create({
        data: {
          userId: input.userId,
          channel: "miniapp",
          role: "assistant",
          content: answer,
          toolCalls: {
            services: services.map((service) => service.id),
            knowledge: knowledge.map((item) => item.id),
            availableSlots
          }
        }
      })
    ]);

    return serializeEntity({
      answer,
      availableSlots,
      services,
      knowledge
    });
  }

  async businessAssistant(input: BusinessAssistantDto) {
    const message = input.message.trim();
    const data = await this.getBusinessData();
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
      this.getBusinessData()
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

  private async getBusinessData() {
    const today = this.startOfShanghaiDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const nextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    const [todayOrders, monthOrders, todayBookings, monthBookings, pendingBookings, customers, memberRecords, popularServices] =
      await Promise.all([
        this.prisma.order.findMany({
          where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] }, createdAt: { gte: today, lt: tomorrow } },
          select: { paidAmount: true }
        }),
        this.prisma.order.findMany({
          where: { status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] }, createdAt: { gte: monthStart, lt: nextMonth } },
          select: { paidAmount: true }
        }),
        this.prisma.booking.count({ where: { bookingDate: today } }),
        this.prisma.booking.count({ where: { bookingDate: { gte: monthStart, lt: nextMonth } } }),
        this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
        this.prisma.consumptionRecord.findMany({
          where: { type: { in: ["MEMBER_BALANCE_PAYMENT", "PACKAGE_CARD_PAYMENT"] }, createdAt: { gte: monthStart, lt: nextMonth } },
          select: { amount: true, type: true }
        }),
        this.prisma.service.findMany({
          include: { _count: { select: { bookings: true } } },
          orderBy: { bookings: { _count: "desc" } },
          take: 5
        })
      ]);

    return {
      todayRevenue: this.sumMoney(todayOrders),
      monthRevenue: this.sumMoney(monthOrders),
      todayBookings,
      monthBookings,
      pendingBookings,
      customers,
      memberConsumption: this.sumMoney(memberRecords),
      popularServices: popularServices.map((service) => ({
        id: service.id,
        name: service.name,
        basePrice: service.basePrice,
        bookingCount: service._count.bookings
      }))
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

    return TIME_SLOTS.filter((slot) => !occupied.has(slot.start)).map((slot) => ({
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
        : "这一天固定时间段已经约满，建议换一天或联系门店人工确认。"
    ];

    if (wantsNotice && knowledge.length > 0) {
      lines.push(`注意事项：${knowledge.map((item) => item.content).join(" ")}`);
    }

    lines.push("如需临时加急、改约或宠物有特殊情况，建议转人工由门店确认。");
    return lines.join("\n");
  }

  private composeBusinessAnswer(message: string, data: Awaited<ReturnType<AiService["getBusinessData"]>>) {
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
      `当前客户数 ${data.customers}，热门服务：${popular}。`,
      advice
    ].join("\n");
  }

  private matchServices(message: string, services: Awaited<ReturnType<PrismaService["service"]["findMany"]>>) {
    return services.filter(
      (service) =>
        message.includes(service.name) ||
        message.includes(service.category) ||
        message.includes(service.petType === "CAT" ? "猫" : "狗") ||
        message.toLowerCase().includes(service.petType.toLowerCase())
    );
  }

  private extractKeywords(message: string) {
    return ["预约", "规则", "注意", "吹风", "洗护", "美容", "寄养", "价格"].filter((keyword) => message.includes(keyword));
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

  private formatShanghaiTime(value: Date) {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(value);
  }

  private startOfShanghaiDay(date: Date) {
    const shanghaiDate = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this.parseDateOnly(shanghaiDate);
  }

  private sumMoney(items: Array<{ paidAmount?: { toNumber: () => number }; amount?: { toNumber: () => number } }>) {
    return items.reduce((sum, item) => sum + (item.paidAmount?.toNumber() ?? item.amount?.toNumber() ?? 0), 0);
  }
}
