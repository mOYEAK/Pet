import { INestApplication } from "@nestjs/common";
import { BookingStatus, NotificationType, OrderStatus, PetGender, PetType, Prisma, UserRole } from "@prisma/client";
import request from "supertest";
import { BookingRemindersService } from "../src/modules/notifications/booking-reminders.service";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { dateOnly, futureDateKey, shanghaiDateKey, shanghaiDateTime } from "./helpers/dates";
import { FIXTURE_IDS, seedBaseFixture } from "./helpers/fixtures";
import { createTestApp, resetTestDatabase } from "./helpers/test-app";

describe("Notifications, reminders, stats and AI API", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    process.env.AI_ENABLED = "false";
    process.env.BOOKING_REMINDER_ENABLED = "false";
    await resetTestDatabase(prisma);
    await seedBaseFixture(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("marks one notification and then all notifications as read", async () => {
    await prisma.notification.createMany({
      data: [
        {
          userId: FIXTURE_IDS.customer,
          title: "通知一",
          content: "第一条通知",
          type: NotificationType.BOOKING_CREATED
        },
        {
          userId: FIXTURE_IDS.customer,
          title: "通知二",
          content: "第二条通知",
          type: NotificationType.BOOKING_CONFIRMED
        }
      ]
    });
    const notifications = await prisma.notification.findMany({ where: { userId: FIXTURE_IDS.customer } });

    await request(app.getHttpServer())
      .get(`/api/notifications/unread-count?userId=${FIXTURE_IDS.customer}`)
      .expect(200, { count: 2 });
    await request(app.getHttpServer()).patch(`/api/notifications/${notifications[0].id}/read`).expect(200);
    await request(app.getHttpServer())
      .get(`/api/notifications/unread-count?userId=${FIXTURE_IDS.customer}`)
      .expect(200, { count: 1 });
    const readAll = await request(app.getHttpServer())
      .patch("/api/notifications/read-all")
      .send({ userId: FIXTURE_IDS.customer })
      .expect(200);

    expect(readAll.body.count).toBe(1);
    await request(app.getHttpServer())
      .get(`/api/notifications/unread-count?userId=${FIXTURE_IDS.customer}`)
      .expect(200, { count: 0 });
  });

  it("creates one arrival reminder and remains idempotent on repeated scans", async () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        userId: FIXTURE_IDS.customer,
        petId: FIXTURE_IDS.pet,
        serviceId: FIXTURE_IDS.service,
        bookingDate: dateOnly(shanghaiDateKey(startTime)),
        startTime,
        endTime: new Date(startTime.getTime() + 90 * 60_000),
        status: BookingStatus.CONFIRMED
      }
    });
    const reminders = app.get(BookingRemindersService);
    process.env.BOOKING_REMINDER_ENABLED = "true";

    const first = await reminders.processDueReminders(now);
    const second = await reminders.processDueReminders(now);

    expect(first.processed).toBe(1);
    expect(second.processed).toBe(0);
    expect(
      await prisma.notification.count({ where: { relatedId: booking.id, type: NotificationType.BOOKING_REMINDER } })
    ).toBe(1);
    expect((await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } })).reminderSentAt).not.toBeNull();
  });

  it("uses paidAt and Shanghai boundaries for reports, excluding cancellations and package-card revenue", async () => {
    const today = shanghaiDateKey();
    const paidAt = shanghaiDateTime(today, "00:30");

    async function createPaidOrder(input: {
      id: string;
      userId: string;
      petId: string;
      serviceId: string;
      payMethod: string;
      amount: number;
      hour: string;
    }) {
      const booking = await prisma.booking.create({
        data: {
          id: `${input.id}-booking`,
          userId: input.userId,
          petId: input.petId,
          serviceId: input.serviceId,
          bookingDate: dateOnly(today),
          startTime: shanghaiDateTime(today, input.hour),
          endTime: new Date(shanghaiDateTime(today, input.hour).getTime() + 90 * 60_000),
          status: BookingStatus.COMPLETED
        }
      });
      await prisma.order.create({
        data: {
          id: input.id,
          bookingId: booking.id,
          userId: input.userId,
          totalAmount: new Prisma.Decimal(input.amount),
          paidAmount: new Prisma.Decimal(input.amount),
          payMethod: input.payMethod,
          status: OrderStatus.PAID,
          paidAt,
          createdAt: new Date(paidAt.getTime() - 2 * 24 * 60 * 60 * 1000)
        }
      });
    }

    const oldPaidAt = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);
    const oldPaidDate = shanghaiDateKey(oldPaidAt);
    await prisma.user.create({
      data: {
        id: "inactive-paid-customer",
        nickname: "超过60天未支付客户",
        phone: "18810000003",
        role: UserRole.CUSTOMER,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      }
    });
    await prisma.pet.create({
      data: {
        id: "inactive-paid-pet",
        userId: "inactive-paid-customer",
        name: "久久",
        type: PetType.CAT,
        gender: PetGender.UNKNOWN
      }
    });
    const oldBooking = await prisma.booking.create({
      data: {
        userId: "inactive-paid-customer",
        petId: "inactive-paid-pet",
        serviceId: FIXTURE_IDS.service,
        bookingDate: dateOnly(oldPaidDate),
        startTime: shanghaiDateTime(oldPaidDate, "09:00"),
        endTime: shanghaiDateTime(oldPaidDate, "10:30"),
        status: BookingStatus.COMPLETED
      }
    });
    await prisma.order.create({
      data: {
        bookingId: oldBooking.id,
        userId: "inactive-paid-customer",
        totalAmount: new Prisma.Decimal(128),
        paidAmount: new Prisma.Decimal(128),
        payMethod: "STORE_PAY",
        status: OrderStatus.PAID,
        paidAt: oldPaidAt
      }
    });

    await createPaidOrder({
      id: "stats-store-order",
      userId: FIXTURE_IDS.customer,
      petId: FIXTURE_IDS.pet,
      serviceId: FIXTURE_IDS.service,
      payMethod: "STORE_PAY",
      amount: 128,
      hour: "09:00"
    });
    await createPaidOrder({
      id: "stats-member-order",
      userId: FIXTURE_IDS.customer,
      petId: FIXTURE_IDS.pet,
      serviceId: FIXTURE_IDS.service,
      payMethod: "MEMBER_BALANCE",
      amount: 128,
      hour: "10:30"
    });
    await createPaidOrder({
      id: "stats-package-order",
      userId: FIXTURE_IDS.otherCustomer,
      petId: FIXTURE_IDS.otherPet,
      serviceId: FIXTURE_IDS.otherService,
      payMethod: "PACKAGE_CARD",
      amount: 188,
      hour: "13:30"
    });
    await prisma.booking.create({
      data: {
        userId: FIXTURE_IDS.customer,
        petId: FIXTURE_IDS.pet,
        serviceId: FIXTURE_IDS.service,
        bookingDate: dateOnly(today),
        startTime: shanghaiDateTime(today, "15:00"),
        endTime: shanghaiDateTime(today, "16:30"),
        status: BookingStatus.CANCELLED
      }
    });

    const overview = await request(app.getHttpServer()).get("/api/stats/overview?period=7d").expect(200);
    expect(overview.body.summary).toMatchObject({
      revenue: 256,
      bookingCount: 3,
      payingCustomerCount: 2,
      repeatCustomerCount: 1,
      repeatRate: 50,
      memberConsumption: 316,
      newCustomerCount: 2,
      inactiveCustomerCount: 2
    });
    expect(overview.body.trend.find((item: { date: string }) => item.date === today)).toMatchObject({
      revenue: 256,
      bookingCount: 3
    });
    expect(overview.body.popularServices.reduce((sum: number, item: { bookingCount: number }) => sum + item.bookingCount, 0)).toBe(3);

    const dashboard = await request(app.getHttpServer()).get("/api/stats/dashboard").expect(200);
    const month = await request(app.getHttpServer()).get("/api/stats/overview?period=month").expect(200);
    const assistant = await request(app.getHttpServer())
      .post("/api/ai/business-assistant")
      .send({ message: "本月经营情况" })
      .expect(201);
    expect(dashboard.body.monthRevenue).toBe(month.body.summary.revenue);
    expect(dashboard.body.monthBookings).toBe(month.body.summary.bookingCount);
    expect(assistant.body.data.monthRevenue).toBe(month.body.summary.revenue);
    expect(assistant.body.data.monthBookings).toBe(month.body.summary.bookingCount);
  });

  it("falls back to rule data, returns an available booking draft and creates no booking", async () => {
    const bookingCountBefore = await prisma.booking.count();
    const response = await request(app.getHttpServer())
      .post("/api/ai/customer-service")
      .send({ userId: FIXTURE_IDS.customer, message: "帮咪咪预约明天13:30的猫咪洗护" })
      .expect(201);

    expect(response.body.mode).toBe("RULE_FALLBACK");
    expect(response.body.services).toEqual(expect.arrayContaining([expect.objectContaining({ id: FIXTURE_IDS.service })]));
    expect(response.body.availableSlots).toEqual(
      expect.arrayContaining([expect.objectContaining({ date: futureDateKey(1), startTime: "13:30", endTime: "15:00" })])
    );
    expect(response.body.bookingDraft).toMatchObject({
      petId: FIXTURE_IDS.pet,
      serviceId: FIXTURE_IDS.service,
      bookingDate: futureDateKey(1),
      startTime: "13:30",
      endTime: "15:00"
    });
    expect(await prisma.booking.count()).toBe(bookingCountBefore);
    expect(await prisma.aiConversation.count({ where: { userId: FIXTURE_IDS.customer } })).toBe(2);
  });
});
