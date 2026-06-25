import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { ChurnRiskQueryDto, CreateFollowUpTaskDto, UpdateFollowUpTaskStatusDto } from "./dto";

@Injectable()
export class FollowUpService {
  constructor(private readonly prisma: PrismaService) {}

  async churnRisk(query: ChurnRiskQueryDto) {
    const days = query.days ?? 60;
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);

    const customers = await this.prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      include: {
        pets: true,
        membership: true,
        orders: {
          where: { status: { in: ["PAID", "COMPLETED"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            booking: {
              include: {
                service: true,
                pet: true
              }
            }
          }
        },
        consumptionRecords: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        followUpTasks: {
          orderBy: { createdAt: "desc" },
          take: 3
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const riskCustomers = customers
      .map((customer) => {
        const lastOrderAt = customer.orders[0]?.createdAt;
        const lastRecordAt = customer.consumptionRecords[0]?.createdAt;
        const lastActivityAt = [lastOrderAt, lastRecordAt].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] ?? null;
        const inactiveDays = lastActivityAt ? Math.floor((Date.now() - lastActivityAt.getTime()) / 86_400_000) : null;
        return {
          ...customer,
          lastActivityAt,
          inactiveDays,
          recallMessage: this.generateRecallMessage(customer.nickname, customer.pets[0]?.name, customer.orders[0]?.booking?.service?.name)
        };
      })
      .filter((customer) => customer.inactiveDays === null || customer.inactiveDays >= days);

    return serializeEntity(riskCustomers);
  }

  async listTasks() {
    const tasks = await this.prisma.followUpTask.findMany({
      include: { user: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
    });

    return serializeEntity(tasks);
  }

  async createTask(input: CreateFollowUpTaskDto) {
    const dueDate = input.dueDate ? this.parseDateOnly(input.dueDate) : undefined;
    const task = await this.prisma.followUpTask.create({
      data: {
        userId: input.userId,
        title: input.title,
        content: input.content,
        dueDate
      },
      include: { user: true }
    });

    return serializeEntity(task);
  }

  async updateTaskStatus(id: string, input: UpdateFollowUpTaskStatusDto) {
    await this.ensureTaskExists(id);
    const task = await this.prisma.followUpTask.update({
      where: { id },
      data: { status: input.status },
      include: { user: true }
    });

    return serializeEntity(task);
  }

  private generateRecallMessage(nickname?: string | null, petName?: string | null, serviceName?: string | null) {
    const customerName = nickname ?? "老朋友";
    const pet = petName ? `家里的 ${petName}` : "宝贝";
    const service = serviceName ?? "洗护护理";
    return `${customerName}您好，最近${pet}状态还好吗？门店这周${service}还有可预约时间，老客户到店可优先安排，欢迎随时联系宠伴管家。`;
  }

  private parseDateOnly(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("日期必须使用 YYYY-MM-DD 格式");
    }

    return new Date(`${date}T00:00:00.000Z`);
  }

  private async ensureTaskExists(id: string) {
    const count = await this.prisma.followUpTask.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("跟进任务不存在");
    }
  }
}
