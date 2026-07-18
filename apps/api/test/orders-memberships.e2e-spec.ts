import { INestApplication } from "@nestjs/common";
import {
  BookingStatus,
  NotificationType,
  OrderStatus,
  PackageCardStatus,
  Prisma,
  UserCouponStatus
} from "@prisma/client";
import request from "supertest";
import { PrismaService } from "../src/modules/prisma/prisma.service";
import { addDays, dateOnly, futureDateKey, shanghaiDateKey, shanghaiDateTime } from "./helpers/dates";
import { FIXTURE_IDS, seedBaseFixture } from "./helpers/fixtures";
import { createTestApp, resetTestDatabase } from "./helpers/test-app";

describe("Orders, coupons and memberships API", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orderSequence = 0;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    orderSequence = 0;
    await resetTestDatabase(prisma);
    await seedBaseFixture(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });

  async function createOrder(serviceId = FIXTURE_IDS.service, userId = FIXTURE_IDS.customer, petId = FIXTURE_IDS.pet) {
    const slot = orderSequence++;
    const startHour = 9 + slot;
    const date = futureDateKey(3 + Math.floor(slot / 8));
    const startTime = shanghaiDateTime(date, `${String(startHour % 18).padStart(2, "0")}:00`);
    const booking = await prisma.booking.create({
      data: {
        userId,
        petId,
        serviceId,
        bookingDate: dateOnly(date),
        startTime,
        endTime: new Date(startTime.getTime() + 90 * 60_000),
        status: BookingStatus.CONFIRMED
      }
    });
    const response = await request(app.getHttpServer())
      .post("/api/orders/from-booking")
      .send({ bookingId: booking.id })
      .expect(201);
    return { booking, orderId: response.body.id as string };
  }

  it("pays with a coupon and commits all payment side effects", async () => {
    const { booking, orderId } = await createOrder();
    const response = await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: FIXTURE_IDS.coupon })
      .expect(200);

    expect(response.body).toMatchObject({
      status: OrderStatus.PAID,
      discountAmount: 20,
      paidAmount: 108,
      couponId: FIXTURE_IDS.coupon
    });
    expect(response.body.paidAt).toEqual(expect.any(String));

    const [storedOrder, storedBooking, coupon, records, notifications] = await Promise.all([
      prisma.order.findUniqueOrThrow({ where: { id: orderId } }),
      prisma.booking.findUniqueOrThrow({ where: { id: booking.id } }),
      prisma.userCoupon.findUniqueOrThrow({ where: { id: FIXTURE_IDS.coupon } }),
      prisma.consumptionRecord.findMany({ where: { orderId } }),
      prisma.notification.findMany({ where: { type: NotificationType.ORDER_PAID, relatedId: orderId } })
    ]);
    expect(storedOrder.paidAt).not.toBeNull();
    expect(storedBooking.status).toBe(BookingStatus.COMPLETED);
    expect(coupon.status).toBe(UserCouponStatus.USED);
    expect(coupon.usedAt).not.toBeNull();
    expect(records).toHaveLength(1);
    expect(records[0].amount.toNumber()).toBe(108);
    expect(notifications).toHaveLength(1);
  });

  it("rejects used, foreign, expired and below-threshold coupons without partial updates", async () => {
    const first = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${first.orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: FIXTURE_IDS.coupon })
      .expect(200);

    const usedCouponOrder = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${usedCouponOrder.orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: FIXTURE_IDS.coupon })
      .expect(400);

    const foreignCouponOrder = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${foreignCouponOrder.orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: FIXTURE_IDS.otherCoupon })
      .expect(400);

    const expiredTemplate = await prisma.couponTemplate.create({
      data: {
        name: "过期券",
        thresholdAmount: new Prisma.Decimal(1),
        discountAmount: new Prisma.Decimal(1),
        endDate: dateOnly(addDays(shanghaiDateKey(), -1))
      }
    });
    const expiredCoupon = await prisma.userCoupon.create({
      data: { templateId: expiredTemplate.id, userId: FIXTURE_IDS.customer }
    });
    const expiredCouponOrder = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${expiredCouponOrder.orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: expiredCoupon.id })
      .expect(400);

    const lowAmountOrder = await createOrder();
    const thresholdCoupon = await prisma.userCoupon.create({
      data: { templateId: FIXTURE_IDS.couponTemplate, userId: FIXTURE_IDS.customer }
    });
    await prisma.order.update({ where: { id: lowAmountOrder.orderId }, data: { totalAmount: new Prisma.Decimal(100) } });
    await request(app.getHttpServer())
      .patch(`/api/orders/${lowAmountOrder.orderId}/pay`)
      .send({ payMethod: "STORE_PAY", couponId: thresholdCoupon.id })
      .expect(400);

    const pendingIds = [usedCouponOrder, foreignCouponOrder, expiredCouponOrder, lowAmountOrder].map((item) => item.orderId);
    expect(await prisma.order.count({ where: { id: { in: pendingIds }, status: OrderStatus.PENDING_PAYMENT } })).toBe(4);
  });

  it("prevents combining a package card with a coupon", async () => {
    const { orderId } = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/pay`)
      .send({ payMethod: "PACKAGE_CARD", packageCardId: FIXTURE_IDS.packageCard, couponId: FIXTURE_IDS.coupon })
      .expect(400);

    expect((await prisma.packageCard.findUniqueOrThrow({ where: { id: FIXTURE_IDS.packageCard } })).remainingTimes).toBe(3);
    expect((await prisma.userCoupon.findUniqueOrThrow({ where: { id: FIXTURE_IDS.coupon } })).status).toBe(
      UserCouponStatus.UNUSED
    );
  });

  it("recharges paid 100 plus bonus 20 and records exact balances", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/memberships/recharges")
      .send({ userId: FIXTURE_IDS.customer, paidAmount: 100, bonusAmount: 20, payMethod: "WECHAT" })
      .expect(201);

    expect(response.body.membership.balance).toBe(320);
    expect(response.body.rechargeRecord).toMatchObject({
      paidAmount: 100,
      bonusAmount: 20,
      creditedAmount: 120,
      balanceBefore: 200,
      balanceAfter: 320
    });
    expect(
      await prisma.notification.count({ where: { userId: FIXTURE_IDS.customer, type: NotificationType.MEMBERSHIP_RECHARGED } })
    ).toBe(1);
  });

  it("rejects invalid recharges and non-customers", async () => {
    await request(app.getHttpServer())
      .post("/api/memberships/recharges")
      .send({ userId: FIXTURE_IDS.customer, paidAmount: 0, payMethod: "CASH" })
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/memberships/recharges")
      .send({ userId: FIXTURE_IDS.customer, paidAmount: 100, bonusAmount: -1, payMethod: "CASH" })
      .expect(400);
    await request(app.getHttpServer())
      .post("/api/memberships/recharges")
      .send({ userId: FIXTURE_IDS.admin, paidAmount: 100, payMethod: "CASH" })
      .expect(400);

    expect(await prisma.rechargeRecord.count()).toBe(0);
    expect((await prisma.membership.findUniqueOrThrow({ where: { userId: FIXTURE_IDS.customer } })).balance.toNumber()).toBe(200);
  });

  it("atomically deducts member balance and leaves no partial update when insufficient", async () => {
    const successful = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${successful.orderId}/pay`)
      .send({ payMethod: "MEMBER_BALANCE" })
      .expect(200);
    expect((await prisma.membership.findUniqueOrThrow({ where: { userId: FIXTURE_IDS.customer } })).balance.toNumber()).toBe(72);

    await prisma.membership.update({ where: { userId: FIXTURE_IDS.customer }, data: { balance: new Prisma.Decimal(50) } });
    const failed = await createOrder();
    const recordsBefore = await prisma.consumptionRecord.count();
    await request(app.getHttpServer())
      .patch(`/api/orders/${failed.orderId}/pay`)
      .send({ payMethod: "MEMBER_BALANCE" })
      .expect(400);

    expect((await prisma.membership.findUniqueOrThrow({ where: { userId: FIXTURE_IDS.customer } })).balance.toNumber()).toBe(50);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: failed.orderId } })).status).toBe(OrderStatus.PENDING_PAYMENT);
    expect(await prisma.consumptionRecord.count()).toBe(recordsBefore);
  });

  it("decrements a valid package card and rejects wrong, expired and zero-use cards", async () => {
    const valid = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${valid.orderId}/pay`)
      .send({ payMethod: "PACKAGE_CARD", packageCardId: FIXTURE_IDS.packageCard })
      .expect(200);
    expect((await prisma.packageCard.findUniqueOrThrow({ where: { id: FIXTURE_IDS.packageCard } })).remainingTimes).toBe(2);

    const wrong = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${wrong.orderId}/pay`)
      .send({ payMethod: "PACKAGE_CARD", packageCardId: FIXTURE_IDS.wrongServiceCard })
      .expect(400);

    const expired = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${expired.orderId}/pay`)
      .send({ payMethod: "PACKAGE_CARD", packageCardId: FIXTURE_IDS.expiredCard })
      .expect(400);

    await prisma.packageCard.update({
      where: { id: FIXTURE_IDS.packageCard },
      data: { remainingTimes: 0, status: PackageCardStatus.ACTIVE }
    });
    const empty = await createOrder();
    await request(app.getHttpServer())
      .patch(`/api/orders/${empty.orderId}/pay`)
      .send({ payMethod: "PACKAGE_CARD", packageCardId: FIXTURE_IDS.packageCard })
      .expect(400);

    expect(await prisma.order.count({ where: { id: { in: [wrong.orderId, expired.orderId, empty.orderId] }, status: OrderStatus.PENDING_PAYMENT } })).toBe(3);
  });
});
