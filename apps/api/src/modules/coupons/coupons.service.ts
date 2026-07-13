import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserCouponStatus, UserRole } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCouponTemplateDto, IssueCouponDto, UpdateCouponTemplateDto } from "./dto";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTemplates() {
    const templates = await this.prisma.couponTemplate.findMany({
      include: {
        _count: {
          select: { userCoupons: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(templates);
  }

  async createTemplate(input: CreateCouponTemplateDto) {
    this.assertTemplateAmount(input.thresholdAmount, input.discountAmount);
    this.assertDateRange(input.startDate, input.endDate);

    const template = await this.prisma.couponTemplate.create({
      data: {
        name: input.name.trim(),
        thresholdAmount: input.thresholdAmount,
        discountAmount: input.discountAmount,
        startDate: input.startDate ? this.parseDateOnly(input.startDate) : undefined,
        endDate: input.endDate ? this.parseDateOnly(input.endDate) : undefined,
        description: input.description?.trim(),
        enabled: input.enabled ?? true
      }
    });

    return serializeEntity(template);
  }

  async updateTemplate(id: string, input: UpdateCouponTemplateDto) {
    const current = await this.prisma.couponTemplate.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException("优惠券模板不存在");
    }

    const thresholdAmount = input.thresholdAmount ?? current.thresholdAmount.toNumber();
    const discountAmount = input.discountAmount ?? current.discountAmount.toNumber();
    this.assertTemplateAmount(thresholdAmount, discountAmount);
    this.assertDateRange(input.startDate ?? current.startDate?.toISOString().slice(0, 10), input.endDate ?? current.endDate?.toISOString().slice(0, 10));

    const template = await this.prisma.couponTemplate.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        thresholdAmount: input.thresholdAmount,
        discountAmount: input.discountAmount,
        startDate: input.startDate ? this.parseDateOnly(input.startDate) : undefined,
        endDate: input.endDate ? this.parseDateOnly(input.endDate) : undefined,
        description: input.description?.trim(),
        enabled: input.enabled
      }
    });

    return serializeEntity(template);
  }

  async issue(input: IssueCouponDto) {
    const [template, user] = await Promise.all([
      this.prisma.couponTemplate.findUnique({ where: { id: input.templateId } }),
      this.prisma.user.findUnique({ where: { id: input.userId } })
    ]);

    if (!template || !template.enabled) {
      throw new BadRequestException("优惠券模板不存在或未启用");
    }

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new BadRequestException("只能给客户发放优惠券");
    }

    if (template.endDate && this.startOfToday().getTime() > template.endDate.getTime()) {
      throw new BadRequestException("优惠券模板已过期");
    }

    const userCoupon = await this.prisma.userCoupon.create({
      data: {
        templateId: template.id,
        userId: user.id
      },
      include: this.userCouponInclude()
    });

    return serializeEntity(userCoupon);
  }

  async listUserCoupons(userId?: string) {
    await this.expireStaleCoupons();

    const coupons = await this.prisma.userCoupon.findMany({
      where: { userId },
      include: this.userCouponInclude(),
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });

    return serializeEntity(coupons);
  }

  private async expireStaleCoupons() {
    await this.prisma.userCoupon.updateMany({
      where: {
        status: UserCouponStatus.UNUSED,
        template: {
          endDate: { lt: this.startOfToday() }
        }
      },
      data: { status: UserCouponStatus.EXPIRED }
    });
  }

  private userCouponInclude() {
    return {
      template: true,
      user: true,
      usedOrder: true
    } satisfies Prisma.UserCouponInclude;
  }

  private assertTemplateAmount(thresholdAmount: number, discountAmount: number) {
    if (discountAmount <= 0) {
      throw new BadRequestException("优惠金额必须大于 0");
    }

    if (thresholdAmount < discountAmount) {
      throw new BadRequestException("优惠金额不能大于使用门槛");
    }
  }

  private assertDateRange(startDate?: string, endDate?: string) {
    if (startDate && endDate && this.parseDateOnly(startDate).getTime() > this.parseDateOnly(endDate).getTime()) {
      throw new BadRequestException("开始日期不能晚于结束日期");
    }
  }

  private parseDateOnly(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private startOfToday() {
    const date = new Date().toISOString().slice(0, 10);
    return this.parseDateOnly(date);
  }
}
