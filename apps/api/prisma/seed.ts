import {
  BookingStatus,
  OrderStatus,
  PackageCardStatus,
  PetGender,
  PetType,
  PrismaClient,
  SizeType,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

function utcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function utcDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
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

  await prisma.service.upsert({
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

  await prisma.service.upsert({
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

  const booking = await prisma.booking.upsert({
    where: { id: "booking_demo_confirmed" },
    update: {
      remark: "第一次到店，请温柔一些。"
    },
    create: {
      id: "booking_demo_confirmed",
      userId: customer.id,
      petId: pet.id,
      serviceId: catBath.id,
      bookingDate: utcDate("2026-06-21"),
      startTime: utcDateTime("2026-06-21", "10:00"),
      endTime: utcDateTime("2026-06-21", "11:30"),
      status: BookingStatus.CONFIRMED,
      remark: "第一次到店，请温柔一些。"
    }
  });

  const order = await prisma.order.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: {
      id: "order_demo_paid",
      bookingId: booking.id,
      userId: customer.id,
      totalAmount: 128,
      paidAmount: 128,
      payMethod: "STORE_PAY",
      status: OrderStatus.PAID
    }
  });

  await prisma.membership.upsert({
    where: { userId: customer.id },
    update: {
      level: "黄金会员",
      balance: 300,
      points: 128
    },
    create: {
      id: "membership_customer_demo",
      userId: customer.id,
      level: "黄金会员",
      balance: 300,
      points: 128
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

  await prisma.consumptionRecord.upsert({
    where: { id: "consumption_demo_order_paid" },
    update: {},
    create: {
      id: "consumption_demo_order_paid",
      userId: customer.id,
      orderId: order.id,
      amount: 128,
      type: "到店支付",
      description: "猫咪洗护消费"
    }
  });

  await prisma.knowledgeBase.upsert({
    where: { id: "kb_booking_rules_demo" },
    update: {
      title: "预约规则",
      content: "请至少提前两小时预约。如需临时加急，请联系门店工作人员。",
      category: "预约"
    },
    create: {
      id: "kb_booking_rules_demo",
      title: "预约规则",
      content: "请至少提前两小时预约。如需临时加急，请联系门店工作人员。",
      category: "预约",
      enabled: true
    }
  });

  await prisma.followUpTask.upsert({
    where: { id: "follow_up_demo" },
    update: {
      title: "回访咪咪首次洗护体验",
      content: "询问咪咪洗护后状态是否稳定。",
      status: "待跟进"
    },
    create: {
      id: "follow_up_demo",
      userId: customer.id,
      title: "回访咪咪首次洗护体验",
      content: "询问咪咪洗护后状态是否稳定。",
      status: "待跟进",
      dueDate: utcDate("2026-06-24")
    }
  });

  console.log(`已写入演示数据：管理员 ${admin.phone}，客户 ${customer.phone}。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
