import { BadRequestException, Injectable } from "@nestjs/common";
import { NotificationType, PackageCardStatus, Prisma, UserRole } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { IssuePackageCardDto, ListMembershipsQueryDto, ListRechargeRecordsQueryDto, RechargeMembershipDto } from "./dto";

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async list(query: ListMembershipsQueryDto) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId: query.userId },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(memberships);
  }

  async getByUserId(userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId },
      include: { user: true }
    });

    return serializeEntity(membership);
  }

  async listPackageCards(userId?: string) {
    const packageCards = await this.prisma.packageCard.findMany({
      where: { userId },
      include: {
        user: true,
        service: true
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(packageCards);
  }

  async listConsumptionRecords(userId?: string) {
    const records = await this.prisma.consumptionRecord.findMany({
      where: { userId },
      include: {
        user: true,
        order: true
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(records);
  }

  async listRechargeRecords(query: ListRechargeRecordsQueryDto) {
    const records = await this.prisma.rechargeRecord.findMany({
      where: { userId: query.userId },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(records);
  }

  async recharge(input: RechargeMembershipDto) {
    const user = await this.ensureCustomer(input.userId);
    const paidAmount = new Prisma.Decimal(input.paidAmount);
    const bonusAmount = new Prisma.Decimal(input.bonusAmount ?? 0);
    const creditedAmount = paidAmount.plus(bonusAmount);

    if (creditedAmount.greaterThan(999999.99)) {
      throw new BadRequestException("单次到账金额不能超过 999999.99 元");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await this.ensureMembership(tx, input.userId);

      const membership = await tx.membership.update({
        where: { userId: input.userId },
        data: { balance: { increment: creditedAmount } },
        include: { user: true }
      });
      const balanceBefore = membership.balance.minus(creditedAmount);
      const rechargeRecord = await tx.rechargeRecord.create({
        data: {
          userId: input.userId,
          paidAmount,
          bonusAmount,
          creditedAmount,
          balanceBefore,
          balanceAfter: membership.balance,
          payMethod: input.payMethod,
          remark: input.remark?.trim() || null
        },
        include: { user: true }
      });

      return { membership, rechargeRecord };
    });

    await this.createNotificationSafely({
      userId: input.userId,
      title: "会员充值到账",
      content: `${user.nickname ?? user.phone ?? "您的账户"}已到账 ¥${creditedAmount.toFixed(2)}（实收 ¥${paidAmount.toFixed(2)}，赠送 ¥${bonusAmount.toFixed(2)}），当前余额 ¥${result.membership.balance.toFixed(2)}。`,
      type: NotificationType.MEMBERSHIP_RECHARGED,
      relatedType: "recharge",
      relatedId: result.rechargeRecord.id
    });

    return serializeEntity(result);
  }

  async issuePackageCard(input: IssuePackageCardDto) {
    const [user, service] = await Promise.all([
      this.ensureCustomer(input.userId),
      this.prisma.service.findUnique({ where: { id: input.serviceId } })
    ]);

    if (!service || !service.enabled) {
      throw new BadRequestException("服务项目不可用，无法发放套餐卡");
    }

    const expireDate = input.expireDate ? this.parseExpireDate(input.expireDate) : null;
    const packageCard = await this.prisma.$transaction(async (tx) => {
      await this.ensureMembership(tx, input.userId);

      return tx.packageCard.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          totalTimes: input.totalTimes,
          remainingTimes: input.totalTimes,
          expireDate,
          status: PackageCardStatus.ACTIVE
        },
        include: {
          user: true,
          service: true
        }
      });
    });

    await this.createNotificationSafely({
      userId: input.userId,
      title: "套餐卡已到账",
      content: `${user.nickname ?? user.phone ?? "您的账户"}已获得${service.name} ${input.totalTimes} 次卡${input.expireDate ? `，有效期至 ${input.expireDate.slice(0, 10)}` : "，长期有效"}。`,
      type: NotificationType.PACKAGE_CARD_ISSUED,
      relatedType: "package_card",
      relatedId: packageCard.id
    });

    return serializeEntity(packageCard);
  }

  private async ensureCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, phone: true, role: true }
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new BadRequestException("只能为有效客户办理会员业务");
    }

    return user;
  }

  private ensureMembership(tx: Prisma.TransactionClient, userId: string) {
    return tx.membership.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        level: "普通会员"
      }
    });
  }

  private parseExpireDate(value: string) {
    const dateKey = value.slice(0, 10);
    const shanghaiToday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    if (dateKey < shanghaiToday) {
      throw new BadRequestException("套餐卡有效期不能早于今天");
    }

    return new Date(`${dateKey}T00:00:00.000Z`);
  }

  private async createNotificationSafely(input: Parameters<NotificationsService["create"]>[0]) {
    try {
      await this.notificationsService.create(input);
    } catch (error) {
      console.warn("会员通知创建失败", error);
    }
  }
}
