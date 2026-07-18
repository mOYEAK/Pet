import {
  PackageCardStatus,
  PetGender,
  PetType,
  Prisma,
  SizeType,
  UserCouponStatus,
  UserRole
} from "@prisma/client";
import { PrismaService } from "../../src/modules/prisma/prisma.service";
import { addDays, dateOnly, shanghaiDateKey } from "./dates";

export const FIXTURE_IDS = {
  customer: "test-customer",
  otherCustomer: "test-other-customer",
  oldCustomer: "test-old-customer",
  admin: "test-admin",
  pet: "test-pet",
  otherPet: "test-other-pet",
  service: "test-service",
  otherService: "test-other-service",
  disabledService: "test-disabled-service",
  membership: "test-membership",
  packageCard: "test-package-card",
  wrongServiceCard: "test-wrong-service-card",
  expiredCard: "test-expired-card",
  couponTemplate: "test-coupon-template",
  coupon: "test-coupon",
  otherCoupon: "test-other-coupon"
} as const;

export async function seedBaseFixture(prisma: PrismaService) {
  const today = shanghaiDateKey();
  const oldDate = new Date(Date.now() - 75 * 24 * 60 * 60 * 1000);

  await prisma.user.createMany({
    data: [
      { id: FIXTURE_IDS.customer, nickname: "测试客户", phone: "18810000000", role: UserRole.CUSTOMER },
      { id: FIXTURE_IDS.otherCustomer, nickname: "其他客户", phone: "18810000001", role: UserRole.CUSTOMER },
      {
        id: FIXTURE_IDS.oldCustomer,
        nickname: "长期未消费客户",
        phone: "18810000002",
        role: UserRole.CUSTOMER,
        createdAt: oldDate,
        updatedAt: oldDate
      },
      { id: FIXTURE_IDS.admin, nickname: "测试管理员", phone: "19910000000", role: UserRole.ADMIN }
    ]
  });

  await prisma.pet.createMany({
    data: [
      {
        id: FIXTURE_IDS.pet,
        userId: FIXTURE_IDS.customer,
        name: "咪咪",
        type: PetType.CAT,
        gender: PetGender.FEMALE
      },
      {
        id: FIXTURE_IDS.otherPet,
        userId: FIXTURE_IDS.otherCustomer,
        name: "团团",
        type: PetType.CAT,
        gender: PetGender.MALE
      }
    ]
  });

  await prisma.service.createMany({
    data: [
      {
        id: FIXTURE_IDS.service,
        name: "猫咪洗护",
        category: "洗护",
        petType: PetType.CAT,
        sizeType: SizeType.SMALL,
        basePrice: new Prisma.Decimal(128),
        durationMinutes: 90,
        enabled: true
      },
      {
        id: FIXTURE_IDS.otherService,
        name: "猫咪美容",
        category: "美容",
        petType: PetType.CAT,
        sizeType: SizeType.SMALL,
        basePrice: new Prisma.Decimal(188),
        durationMinutes: 90,
        enabled: true
      },
      {
        id: FIXTURE_IDS.disabledService,
        name: "停用服务",
        category: "洗护",
        petType: PetType.CAT,
        sizeType: SizeType.SMALL,
        basePrice: new Prisma.Decimal(88),
        durationMinutes: 90,
        enabled: false
      }
    ]
  });

  await prisma.membership.create({
    data: {
      id: FIXTURE_IDS.membership,
      userId: FIXTURE_IDS.customer,
      level: "普通会员",
      balance: new Prisma.Decimal(200)
    }
  });

  await prisma.packageCard.createMany({
    data: [
      {
        id: FIXTURE_IDS.packageCard,
        userId: FIXTURE_IDS.customer,
        serviceId: FIXTURE_IDS.service,
        totalTimes: 3,
        remainingTimes: 3,
        status: PackageCardStatus.ACTIVE
      },
      {
        id: FIXTURE_IDS.wrongServiceCard,
        userId: FIXTURE_IDS.customer,
        serviceId: FIXTURE_IDS.otherService,
        totalTimes: 3,
        remainingTimes: 3,
        status: PackageCardStatus.ACTIVE
      },
      {
        id: FIXTURE_IDS.expiredCard,
        userId: FIXTURE_IDS.customer,
        serviceId: FIXTURE_IDS.service,
        totalTimes: 3,
        remainingTimes: 3,
        expireDate: dateOnly(addDays(today, -1)),
        status: PackageCardStatus.ACTIVE
      }
    ]
  });

  await prisma.couponTemplate.create({
    data: {
      id: FIXTURE_IDS.couponTemplate,
      name: "满128减20",
      thresholdAmount: new Prisma.Decimal(128),
      discountAmount: new Prisma.Decimal(20),
      startDate: dateOnly(addDays(today, -1)),
      endDate: dateOnly(addDays(today, 30)),
      enabled: true
    }
  });

  await prisma.userCoupon.createMany({
    data: [
      {
        id: FIXTURE_IDS.coupon,
        templateId: FIXTURE_IDS.couponTemplate,
        userId: FIXTURE_IDS.customer,
        status: UserCouponStatus.UNUSED
      },
      {
        id: FIXTURE_IDS.otherCoupon,
        templateId: FIXTURE_IDS.couponTemplate,
        userId: FIXTURE_IDS.otherCustomer,
        status: UserCouponStatus.UNUSED
      }
    ]
  });

  await prisma.knowledgeBase.create({
    data: {
      title: "猫咪洗护注意事项",
      content: "洗护前请告知宠物健康情况。",
      category: "洗护",
      enabled: true
    }
  });
}
