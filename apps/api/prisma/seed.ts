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
      nickname: "Store Admin",
      role: UserRole.ADMIN
    },
    create: {
      id: "user_admin_demo",
      phone: "19900000000",
      nickname: "Store Admin",
      role: UserRole.ADMIN
    }
  });

  const customer = await prisma.user.upsert({
    where: { phone: "18800000000" },
    update: {
      nickname: "Mimi Owner",
      role: UserRole.CUSTOMER
    },
    create: {
      id: "user_customer_demo",
      phone: "18800000000",
      nickname: "Mimi Owner",
      role: UserRole.CUSTOMER
    }
  });

  const catBath = await prisma.service.upsert({
    where: { id: "service_cat_bath" },
    update: {},
    create: {
      id: "service_cat_bath",
      name: "Cat Bath",
      category: "Cat Care",
      petType: PetType.CAT,
      sizeType: SizeType.UNKNOWN,
      basePrice: 128,
      durationMinutes: 90,
      description: "Basic cat bath, drying, and coat care.",
      notice: "Please tell us if the cat is afraid of drying.",
      enabled: true
    }
  });

  await prisma.service.upsert({
    where: { id: "service_small_dog_bath" },
    update: {},
    create: {
      id: "service_small_dog_bath",
      name: "Small Dog Bath",
      category: "Dog Care",
      petType: PetType.DOG,
      sizeType: SizeType.SMALL,
      basePrice: 98,
      durationMinutes: 60,
      description: "Bath and drying for small dogs.",
      notice: "Please arrive ten minutes early.",
      enabled: true
    }
  });

  await prisma.service.upsert({
    where: { id: "service_pet_grooming" },
    update: {},
    create: {
      id: "service_pet_grooming",
      name: "Pet Grooming",
      category: "Grooming",
      petType: PetType.DOG,
      sizeType: SizeType.MEDIUM,
      basePrice: 198,
      durationMinutes: 120,
      description: "Styling, trimming, nail care, and basic cleaning.",
      notice: "Grooming duration may vary by coat condition.",
      enabled: true
    }
  });

  const pet = await prisma.pet.upsert({
    where: { id: "pet_mimi_demo" },
    update: {},
    create: {
      id: "pet_mimi_demo",
      userId: customer.id,
      name: "Mimi",
      type: PetType.CAT,
      breed: "British Shorthair",
      gender: PetGender.FEMALE,
      age: 3,
      weight: 4.2,
      isNeutered: true,
      notes: "Afraid of loud drying."
    }
  });

  const booking = await prisma.booking.upsert({
    where: { id: "booking_demo_confirmed" },
    update: {},
    create: {
      id: "booking_demo_confirmed",
      userId: customer.id,
      petId: pet.id,
      serviceId: catBath.id,
      bookingDate: utcDate("2026-06-21"),
      startTime: utcDateTime("2026-06-21", "10:00"),
      endTime: utcDateTime("2026-06-21", "11:30"),
      status: BookingStatus.CONFIRMED,
      remark: "First visit, please be gentle."
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
      level: "gold",
      balance: 300,
      points: 128
    },
    create: {
      id: "membership_customer_demo",
      userId: customer.id,
      level: "gold",
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
      type: "ORDER_PAYMENT",
      description: "Cat bath payment"
    }
  });

  await prisma.knowledgeBase.upsert({
    where: { id: "kb_booking_rules_demo" },
    update: {},
    create: {
      id: "kb_booking_rules_demo",
      title: "Booking Rules",
      content: "Please book at least two hours in advance. Contact staff for urgent bookings.",
      category: "booking",
      enabled: true
    }
  });

  await prisma.followUpTask.upsert({
    where: { id: "follow_up_demo" },
    update: {},
    create: {
      id: "follow_up_demo",
      userId: customer.id,
      title: "Check Mimi after first bath",
      content: "Ask whether Mimi reacted well after drying.",
      status: "pending",
      dueDate: utcDate("2026-06-24")
    }
  });

  console.log(`Seeded demo data for admin ${admin.phone} and customer ${customer.phone}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
