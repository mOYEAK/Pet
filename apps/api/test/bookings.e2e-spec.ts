import { INestApplication } from "@nestjs/common";
import { BookingStatus, NotificationType } from "@prisma/client";
import request from "supertest";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { addDays, futureDateKey, shanghaiDateKey } from "./helpers/dates";
import { FIXTURE_IDS, seedBaseFixture } from "./helpers/fixtures";
import { assertIsolatedTestDatabase, createTestApp, resetTestDatabase } from "./helpers/test-app";

describe("Bookings API", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
    await seedBaseFixture(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });

  function bookingPayload(overrides: Record<string, unknown> = {}) {
    return {
      userId: FIXTURE_IDS.customer,
      petId: FIXTURE_IDS.pet,
      serviceId: FIXTURE_IDS.service,
      bookingDate: futureDateKey(),
      startTime: "09:00",
      endTime: "10:30",
      ...overrides
    };
  }

  it("refuses to reset the local demonstration database", () => {
    expect(() =>
      assertIsolatedTestDatabase("postgresql://petcare:petcare@localhost:5432/petcare?schema=public")
    ).toThrow(/Refusing to reset database/);
  });

  it("creates a customer booking as PENDING with only a submission notification", async () => {
    const response = await request(app.getHttpServer()).post("/api/bookings").send(bookingPayload()).expect(201);

    expect(response.body.status).toBe(BookingStatus.PENDING);
    const notifications = await prisma.notification.findMany({ where: { relatedId: response.body.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe(NotificationType.BOOKING_CREATED);
  });

  it("creates an admin-entered booking as CONFIRMED with only a confirmation notification", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/bookings")
      .send(bookingPayload({ status: BookingStatus.CONFIRMED }))
      .expect(201);

    expect(response.body.status).toBe(BookingStatus.CONFIRMED);
    const notifications = await prisma.notification.findMany({ where: { relatedId: response.body.id } });
    expect(notifications.map((item) => item.type)).toEqual([NotificationType.BOOKING_CONFIRMED]);
  });

  it("rejects conflicts, past times, foreign pets and disabled services", async () => {
    await request(app.getHttpServer()).post("/api/bookings").send(bookingPayload()).expect(201);
    await request(app.getHttpServer())
      .post("/api/bookings")
      .send(bookingPayload({ startTime: "09:30", endTime: "11:00" }))
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/bookings")
      .send(bookingPayload({ bookingDate: addDays(shanghaiDateKey(), -1), startTime: "16:30", endTime: "18:00" }))
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/bookings")
      .send(bookingPayload({ petId: FIXTURE_IDS.otherPet, startTime: "10:30", endTime: "12:00" }))
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/bookings")
      .send(bookingPayload({ serviceId: FIXTURE_IDS.disabledService, startTime: "10:30", endTime: "12:00" }))
      .expect(400);

    expect(await prisma.booking.count()).toBe(1);
  });

  it("releases a time slot after cancellation", async () => {
    const first = await request(app.getHttpServer()).post("/api/bookings").send(bookingPayload()).expect(201);
    await request(app.getHttpServer()).patch(`/api/bookings/${first.body.id}/cancel`).expect(200);

    const replacement = await request(app.getHttpServer()).post("/api/bookings").send(bookingPayload()).expect(201);
    expect(replacement.body.status).toBe(BookingStatus.PENDING);
    expect(await prisma.booking.count({ where: { status: BookingStatus.CANCELLED } })).toBe(1);
  });
});
