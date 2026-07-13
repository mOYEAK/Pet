import {
  BookingStatus,
  NotificationType,
  OrderStatus,
  PackageCardStatus,
  PetGender,
  PetType,
  PrismaClient,
  SizeType,
  UserCouponStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

function utcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function storeDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0));
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { phone: "19900000000" },
    update: {
      nickname: "门店管理员",
      role: UserRole.ADMIN
    },
    create: {
      id: "user_admin_demo",
      phone: "19900000000",
      nickname: "门店管理员",
      role: UserRole.ADMIN
    }
  });

  const customer = await prisma.user.upsert({
    where: { phone: "18800000000" },
    update: {
      nickname: "咪咪主人",
      role: UserRole.CUSTOMER
    },
    create: {
      id: "user_customer_demo",
      phone: "18800000000",
      nickname: "咪咪主人",
      role: UserRole.CUSTOMER
    }
  });

  const dogCustomer = await prisma.user.upsert({
    where: { phone: "18800000001" },
    update: {
      nickname: "小黄主人",
      role: UserRole.CUSTOMER
    },
    create: {
      id: "user_dog_customer_demo",
      phone: "18800000001",
      nickname: "小黄主人",
      role: UserRole.CUSTOMER
    }
  });

  const inactiveCustomer = await prisma.user.upsert({
    where: { phone: "18800000002" },
    update: {
      nickname: "团团主人",
      role: UserRole.CUSTOMER
    },
    create: {
      id: "user_inactive_customer_demo",
      phone: "18800000002",
      nickname: "团团主人",
      role: UserRole.CUSTOMER
    }
  });

  const catBath = await prisma.service.upsert({
    where: { id: "service_cat_bath" },
    update: {
      name: "猫咪洗护",
      category: "猫咪护理",
      basePrice: 128,
      durationMinutes: 90,
      description: "基础猫咪洗澡、吹干和毛发护理。",
      notice: "如果猫咪害怕吹风，请提前告知门店。",
      enabled: true
    },
    create: {
      id: "service_cat_bath",
      name: "猫咪洗护",
      category: "猫咪护理",
      petType: PetType.CAT,
      sizeType: SizeType.UNKNOWN,
      basePrice: 128,
      durationMinutes: 90,
      description: "基础猫咪洗澡、吹干和毛发护理。",
      notice: "如果猫咪害怕吹风，请提前告知门店。",
      enabled: true
    }
  });

  const dogBath = await prisma.service.upsert({
    where: { id: "service_small_dog_bath" },
    update: {
      name: "小型犬洗护",
      category: "狗狗护理",
      basePrice: 98,
      durationMinutes: 60,
      description: "适合小型犬的洗澡和吹干服务。",
      notice: "请提前十分钟到店。",
      enabled: true
    },
    create: {
      id: "service_small_dog_bath",
      name: "小型犬洗护",
      category: "狗狗护理",
      petType: PetType.DOG,
      sizeType: SizeType.SMALL,
      basePrice: 98,
      durationMinutes: 60,
      description: "适合小型犬的洗澡和吹干服务。",
      notice: "请提前十分钟到店。",
      enabled: true
    }
  });

  const grooming = await prisma.service.upsert({
    where: { id: "service_pet_grooming" },
    update: {
      name: "宠物美容护理",
      category: "宠物美容",
      basePrice: 198,
      durationMinutes: 120,
      description: "造型修剪、指甲护理和基础清洁。",
      notice: "实际服务时长会根据毛发情况调整。",
      enabled: true
    },
    create: {
      id: "service_pet_grooming",
      name: "宠物美容护理",
      category: "宠物美容",
      petType: PetType.DOG,
      sizeType: SizeType.MEDIUM,
      basePrice: 198,
      durationMinutes: 120,
      description: "造型修剪、指甲护理和基础清洁。",
      notice: "实际服务时长会根据毛发情况调整。",
      enabled: true
    }
  });

  const catBoarding = await prisma.service.upsert({
    where: { id: "service_cat_boarding" },
    update: {
      name: "猫咪寄养",
      category: "宠物寄养",
      basePrice: 88,
      durationMinutes: 1440,
      description: "猫咪单日寄养，含基础喂食和环境清洁。",
      notice: "请携带常用猫粮和疫苗记录。",
      enabled: true
    },
    create: {
      id: "service_cat_boarding",
      name: "猫咪寄养",
      category: "宠物寄养",
      petType: PetType.CAT,
      sizeType: SizeType.UNKNOWN,
      basePrice: 88,
      durationMinutes: 1440,
      description: "猫咪单日寄养，含基础喂食和环境清洁。",
      notice: "请携带常用猫粮和疫苗记录。",
      enabled: true
    }
  });

  const couponTemplate = await prisma.couponTemplate.upsert({
    where: { id: "coupon_template_return_20_demo" },
    update: {
      name: "老客户护理满减券",
      thresholdAmount: 128,
      discountAmount: 20,
      startDate: utcDate("2026-01-01"),
      endDate: utcDate("2027-12-31"),
      description: "护理类服务满 128 减 20，用于优惠券核销演示。",
      enabled: true
    },
    create: {
      id: "coupon_template_return_20_demo",
      name: "老客户护理满减券",
      thresholdAmount: 128,
      discountAmount: 20,
      startDate: utcDate("2026-01-01"),
      endDate: utcDate("2027-12-31"),
      description: "护理类服务满 128 减 20，用于优惠券核销演示。",
      enabled: true
    }
  });

  const pet = await prisma.pet.upsert({
    where: { id: "pet_mimi_demo" },
    update: {
      name: "咪咪",
      breed: "英短",
      notes: "害怕大声吹风。"
    },
    create: {
      id: "pet_mimi_demo",
      userId: customer.id,
      name: "咪咪",
      type: PetType.CAT,
      breed: "英短",
      gender: PetGender.FEMALE,
      age: 3,
      weight: 4.2,
      isNeutered: true,
      notes: "害怕大声吹风。"
    }
  });

  const dog = await prisma.pet.upsert({
    where: { id: "pet_xiaohuang_demo" },
    update: {
      name: "小黄",
      breed: "泰迪",
      notes: "胆小，剪指甲时需要安抚。"
    },
    create: {
      id: "pet_xiaohuang_demo",
      userId: dogCustomer.id,
      name: "小黄",
      type: PetType.DOG,
      breed: "泰迪",
      gender: PetGender.MALE,
      age: 2,
      weight: 5.6,
      isNeutered: false,
      notes: "胆小，剪指甲时需要安抚。"
    }
  });

  const inactivePet = await prisma.pet.upsert({
    where: { id: "pet_tuantuan_demo" },
    update: {
      name: "团团",
      breed: "布偶",
      notes: "皮肤敏感，建议低敏洗护。"
    },
    create: {
      id: "pet_tuantuan_demo",
      userId: inactiveCustomer.id,
      name: "团团",
      type: PetType.CAT,
      breed: "布偶",
      gender: PetGender.FEMALE,
      age: 4,
      weight: 5.1,
      isNeutered: true,
      notes: "皮肤敏感，建议低敏洗护。"
    }
  });

  await upsertUserCoupon("user_coupon_customer_unused_demo", couponTemplate.id, customer.id, UserCouponStatus.UNUSED);
  await upsertUserCoupon("user_coupon_dog_unused_demo", couponTemplate.id, dogCustomer.id, UserCouponStatus.UNUSED);
  const usedCoupon = await upsertUserCoupon("user_coupon_customer_used_demo", couponTemplate.id, customer.id, UserCouponStatus.USED, "2026-06-27");

  const booking = await prisma.booking.upsert({
    where: { id: "booking_demo_confirmed" },
    update: {
      bookingDate: utcDate("2026-06-27"),
      startTime: storeDateTime("2026-06-27", "10:30"),
      endTime: storeDateTime("2026-06-27", "12:00"),
      status: BookingStatus.CONFIRMED,
      remark: "第一次到店，请温柔一些。"
    },
    create: {
      id: "booking_demo_confirmed",
      userId: customer.id,
      petId: pet.id,
      serviceId: catBath.id,
      bookingDate: utcDate("2026-06-27"),
      startTime: storeDateTime("2026-06-27", "10:30"),
      endTime: storeDateTime("2026-06-27", "12:00"),
      status: BookingStatus.CONFIRMED,
      remark: "第一次到店，请温柔一些。"
    }
  });

  const pendingBooking = await prisma.booking.upsert({
    where: { id: "booking_demo_pending" },
    update: {
      bookingDate: utcDate("2026-06-27"),
      startTime: storeDateTime("2026-06-27", "15:00"),
      endTime: storeDateTime("2026-06-27", "16:30"),
      status: BookingStatus.PENDING,
      remark: "客户希望尽量安排安静区域。"
    },
    create: {
      id: "booking_demo_pending",
      userId: dogCustomer.id,
      petId: dog.id,
      serviceId: grooming.id,
      bookingDate: utcDate("2026-06-27"),
      startTime: storeDateTime("2026-06-27", "15:00"),
      endTime: storeDateTime("2026-06-27", "16:30"),
      status: BookingStatus.PENDING,
      remark: "客户希望尽量安排安静区域。"
    }
  });

  const oldBooking = await prisma.booking.upsert({
    where: { id: "booking_demo_old" },
    update: {
      bookingDate: utcDate("2026-03-20"),
      startTime: storeDateTime("2026-03-20", "09:00"),
      endTime: storeDateTime("2026-03-20", "10:30"),
      status: BookingStatus.COMPLETED,
      remark: "老客户历史消费，用于召回演示。"
    },
    create: {
      id: "booking_demo_old",
      userId: inactiveCustomer.id,
      petId: inactivePet.id,
      serviceId: catBath.id,
      bookingDate: utcDate("2026-03-20"),
      startTime: storeDateTime("2026-03-20", "09:00"),
      endTime: storeDateTime("2026-03-20", "10:30"),
      status: BookingStatus.COMPLETED,
      remark: "老客户历史消费，用于召回演示。"
    }
  });

  const order = await upsertOrder("order_demo_paid", booking.id, customer.id, 128, 108, "STORE_PAY", OrderStatus.PAID, 20, usedCoupon.id);
  const dogOrder = await upsertOrder("order_demo_dog_paid", pendingBooking.id, dogCustomer.id, 198, 198, "MOCK_PAY", OrderStatus.PAID);
  const oldOrder = await upsertOrder("order_demo_old_paid", oldBooking.id, inactiveCustomer.id, 128, 128, "MEMBER_BALANCE", OrderStatus.PAID);

  await prisma.membership.upsert({
    where: { userId: customer.id },
    update: {
      level: "黄金会员",
      balance: 300,
      points: 328
    },
    create: {
      id: "membership_customer_demo",
      userId: customer.id,
      level: "黄金会员",
      balance: 300,
      points: 328
    }
  });

  await prisma.membership.upsert({
    where: { userId: dogCustomer.id },
    update: {
      level: "白银会员",
      balance: 120,
      points: 98
    },
    create: {
      id: "membership_dog_customer_demo",
      userId: dogCustomer.id,
      level: "白银会员",
      balance: 120,
      points: 98
    }
  });

  await prisma.membership.upsert({
    where: { userId: inactiveCustomer.id },
    update: {
      level: "普通会员",
      balance: 20,
      points: 58
    },
    create: {
      id: "membership_inactive_customer_demo",
      userId: inactiveCustomer.id,
      level: "普通会员",
      balance: 20,
      points: 58
    }
  });

  await prisma.packageCard.upsert({
    where: { id: "package_card_cat_bath_demo" },
    update: {
      remainingTimes: 4,
      status: PackageCardStatus.ACTIVE
    },
    create: {
      id: "package_card_cat_bath_demo",
      userId: customer.id,
      serviceId: catBath.id,
      totalTimes: 5,
      remainingTimes: 4,
      expireDate: utcDate("2027-06-21"),
      status: PackageCardStatus.ACTIVE
    }
  });

  await prisma.packageCard.upsert({
    where: { id: "package_card_dog_bath_demo" },
    update: {
      remainingTimes: 8,
      status: PackageCardStatus.ACTIVE
    },
    create: {
      id: "package_card_dog_bath_demo",
      userId: dogCustomer.id,
      serviceId: dogBath.id,
      totalTimes: 10,
      remainingTimes: 8,
      expireDate: utcDate("2027-03-01"),
      status: PackageCardStatus.ACTIVE
    }
  });

  await upsertConsumption("consumption_demo_order_paid", customer.id, order.id, 108, "ORDER_PAYMENT", "猫咪洗护到店支付，优惠 ¥20.00");
  await upsertConsumption("consumption_demo_dog_paid", dogCustomer.id, dogOrder.id, 198, "ORDER_PAYMENT", "宠物美容护理模拟支付");
  await upsertConsumption("consumption_demo_old_paid", inactiveCustomer.id, oldOrder.id, 128, "MEMBER_BALANCE_PAYMENT", "猫咪洗护会员余额支付");

  await upsertNotification(
    "notification_booking_confirmed_demo",
    customer.id,
    "预约已确认",
    "猫咪洗护预约已确认，请按时到店。",
    NotificationType.BOOKING_CONFIRMED,
    "booking",
    booking.id,
    false
  );
  await upsertNotification(
    "notification_order_paid_demo",
    customer.id,
    "订单已支付",
    "猫咪洗护已完成支付，实付 ¥108.00，优惠 ¥20.00。",
    NotificationType.ORDER_PAID,
    "order",
    order.id,
    true
  );
  await upsertNotification(
    "notification_dog_pending_demo",
    dogCustomer.id,
    "预约已提交",
    "宠物美容护理预约已提交，门店确认后会更新状态。",
    NotificationType.BOOKING_CREATED,
    "booking",
    pendingBooking.id,
    false
  );

  await upsertKnowledge("kb_booking_rules_demo", "预约规则", "请至少提前两小时预约。如需临时加急，请联系门店工作人员。", "预约");
  await upsertKnowledge("kb_cat_notice_demo", "猫咪洗护注意事项", "猫咪害怕吹风或容易应激时，请提前备注，门店会安排更温柔的吹干方式。", "护理");
  await upsertKnowledge("kb_boarding_notice_demo", "寄养准备", "寄养请携带常用粮、疫苗记录和熟悉的小毯子，帮助宠物更快适应环境。", "寄养");

  await upsertFollowUp("follow_up_demo", customer.id, "回访咪咪首次洗护体验", "询问咪咪洗护后状态是否稳定。", "待跟进", "2026-06-28");
  await upsertFollowUp("follow_up_inactive_demo", inactiveCustomer.id, "召回团团主人", "团团已经超过 90 天未到店，建议发送低敏洗护召回文案。", "pending", "2026-06-29");

  await prisma.aiConversation.createMany({
    data: [
      {
        userId: customer.id,
        channel: "miniapp",
        role: "user",
        content: "猫咪洗护多少钱，明天下午还有位置吗？"
      },
      {
        userId: customer.id,
        channel: "miniapp",
        role: "assistant",
        content: "猫咪洗护 ¥128，约 90 分钟。明天下午可选 13:30-15:00、15:00-16:30。"
      }
    ],
    skipDuplicates: true
  });

  console.log(`已写入演示数据：管理员 ${admin.phone}，客户 ${customer.phone} / ${dogCustomer.phone} / ${inactiveCustomer.phone}。`);
}

async function upsertOrder(
  id: string,
  bookingId: string,
  userId: string,
  totalAmount: number,
  paidAmount: number,
  payMethod: string,
  status: OrderStatus,
  discountAmount = 0,
  couponId?: string
) {
  return prisma.order.upsert({
    where: { bookingId },
    update: {
      totalAmount,
      discountAmount,
      paidAmount,
      payMethod,
      couponId,
      status
    },
    create: {
      id,
      bookingId,
      userId,
      totalAmount,
      discountAmount,
      paidAmount,
      payMethod,
      couponId,
      status
    }
  });
}

async function upsertUserCoupon(id: string, templateId: string, userId: string, status: UserCouponStatus, usedAt?: string) {
  return prisma.userCoupon.upsert({
    where: { id },
    update: {
      templateId,
      userId,
      status,
      usedAt: usedAt ? storeDateTime(usedAt, "12:00") : null
    },
    create: {
      id,
      templateId,
      userId,
      status,
      usedAt: usedAt ? storeDateTime(usedAt, "12:00") : null
    }
  });
}

async function upsertConsumption(id: string, userId: string, orderId: string, amount: number, type: string, description: string) {
  await prisma.consumptionRecord.upsert({
    where: { id },
    update: {
      amount,
      type,
      description
    },
    create: {
      id,
      userId,
      orderId,
      amount,
      type,
      description
    }
  });
}

async function upsertKnowledge(id: string, title: string, content: string, category: string) {
  await prisma.knowledgeBase.upsert({
    where: { id },
    update: {
      title,
      content,
      category,
      enabled: true
    },
    create: {
      id,
      title,
      content,
      category,
      enabled: true
    }
  });
}

async function upsertFollowUp(id: string, userId: string, title: string, content: string, status: string, dueDate: string) {
  await prisma.followUpTask.upsert({
    where: { id },
    update: {
      title,
      content,
      status,
      dueDate: utcDate(dueDate)
    },
    create: {
      id,
      userId,
      title,
      content,
      status,
      dueDate: utcDate(dueDate)
    }
  });
}

async function upsertNotification(
  id: string,
  userId: string,
  title: string,
  content: string,
  type: NotificationType,
  relatedType: string,
  relatedId: string,
  read: boolean
) {
  await prisma.notification.upsert({
    where: { id },
    update: {
      title,
      content,
      type,
      relatedType,
      relatedId,
      readAt: read ? new Date() : null
    },
    create: {
      id,
      userId,
      title,
      content,
      type,
      relatedType,
      relatedId,
      readAt: read ? new Date() : null
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
