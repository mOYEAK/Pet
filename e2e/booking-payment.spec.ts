import { expect, test } from "@playwright/test";

const adminUrl = "http://127.0.0.1:4173";
const miniappUrl = "http://127.0.0.1:4174";
const remark = "Playwright 预约支付闭环";

function shanghaiFutureDateKey(days: number) {
  const shanghaiNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
  shanghaiNow.setUTCDate(shanghaiNow.getUTCDate() + days);
  return shanghaiNow.toISOString().slice(0, 10);
}

test("客户预约、后台确认、生成订单并使用优惠券完成支付", async ({
  browser,
}) => {
  const bookingDate = shanghaiFutureDateKey(7);
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();

  await customerPage.goto(`${miniappUrl}/#/pages/home/index`);
  await customerPage.waitForFunction(() =>
    Boolean((window as typeof window & { uni?: unknown }).uni),
  );
  await customerPage.evaluate(
    ({ date }) => {
      const uni = (
        window as typeof window & {
          uni: { setStorageSync: (key: string, value: unknown) => void };
        }
      ).uni;
      uni.setStorageSync("bookingDraft", {
        petId: "pet_mimi_demo",
        serviceId: "service_cat_bath",
        bookingDate: date,
        startTime: "09:00",
        endTime: "10:30",
      });
    },
    { date: bookingDate },
  );

  await customerPage.goto(`${miniappUrl}/#/pages/bookings/index`);
  await expect(customerPage.getByTestId("booking-pet")).toContainText("咪咪");
  await expect(customerPage.getByTestId("booking-service")).toContainText(
    "猫咪洗护",
  );
  await expect(customerPage.getByTestId("booking-date")).toContainText(
    bookingDate,
  );
  await customerPage
    .getByTestId("booking-remark")
    .getByRole("textbox")
    .fill(remark);

  const bookingResponsePromise = customerPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/bookings") &&
      response.request().method() === "POST",
  );
  await customerPage.getByTestId("booking-submit").click();
  const bookingResponse = await bookingResponsePromise;
  expect(bookingResponse.ok()).toBeTruthy();
  const booking = (await bookingResponse.json()) as {
    id: string;
    status: string;
  };
  expect(booking.status).toBe("PENDING");
  await expect(
    customerPage.getByTestId(`booking-card-${booking.id}`),
  ).toContainText("待确认");

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${adminUrl}/login`);
  await adminPage.getByTestId("admin-login-submit").click();
  await expect(adminPage).toHaveURL(`${adminUrl}/`);

  await adminPage.goto(`${adminUrl}/bookings`);
  await expect(adminPage.getByText(remark, { exact: true })).toBeVisible();

  const confirmResponsePromise = adminPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/bookings/${booking.id}/status`) &&
      response.request().method() === "PATCH",
  );
  await adminPage.getByTestId(`booking-confirm-${booking.id}`).click();
  expect((await confirmResponsePromise).ok()).toBeTruthy();
  await expect(
    adminPage.getByTestId(`booking-confirm-${booking.id}`),
  ).toBeDisabled();

  const orderResponsePromise = adminPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/orders/from-booking") &&
      response.request().method() === "POST",
  );
  await adminPage.getByTestId(`booking-create-order-${booking.id}`).click();
  const orderResponse = await orderResponsePromise;
  expect(orderResponse.ok()).toBeTruthy();
  const order = (await orderResponse.json()) as { id: string; status: string };
  expect(order.status).toBe("PENDING_PAYMENT");

  await adminPage.goto(`${adminUrl}/orders`);
  await adminPage.getByTestId(`order-pay-${order.id}`).click();
  await adminPage.getByTestId("payment-coupon").click();
  await adminPage.getByRole("option", { name: /老客户护理满减券/ }).click();

  const payResponsePromise = adminPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/orders/${order.id}/pay`) &&
      response.request().method() === "PATCH",
  );
  await adminPage.getByTestId("payment-confirm").click();
  const payResponse = await payResponsePromise;
  expect(payResponse.ok()).toBeTruthy();
  const paidOrder = (await payResponse.json()) as {
    status: string;
    discountAmount: number;
    paidAmount: number;
  };
  expect(paidOrder).toMatchObject({
    status: "PAID",
    discountAmount: 20,
    paidAmount: 108,
  });

  await customerPage.reload();
  const paidBookingCard = customerPage.getByTestId(
    `booking-card-${booking.id}`,
  );
  await expect(paidBookingCard).toContainText("已完成");
  await expect(paidBookingCard).toContainText("已支付");
  await expect(paidBookingCard).toContainText("优惠：-¥20.00");
  await expect(paidBookingCard).toContainText("实付：¥108.00");

  await adminContext.close();
  await customerContext.close();
});
