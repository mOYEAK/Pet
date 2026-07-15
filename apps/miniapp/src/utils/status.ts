export const bookingStatusText: Record<string, string> = {
  PENDING: "待确认",
  CONFIRMED: "已确认",
  SERVING: "服务中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

export const orderStatusText: Record<string, string> = {
  PENDING_PAYMENT: "待支付",
  PAID: "已支付",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REFUNDED: "已退款"
};

export const payMethodText: Record<string, string> = {
  STORE_PAY: "到店支付",
  MEMBER_BALANCE: "会员余额",
  PACKAGE_CARD: "套餐卡",
  MOCK_PAY: "模拟支付"
};

export const consumptionTypeText: Record<string, string> = {
  ORDER_PAYMENT: "订单支付",
  MEMBER_BALANCE_PAYMENT: "会员余额支付",
  PACKAGE_CARD_PAYMENT: "套餐卡核销"
};

export const packageCardStatusText: Record<string, string> = {
  ACTIVE: "有效",
  EXPIRED: "已过期",
  DISABLED: "已停用"
};

export const userCouponStatusText: Record<string, string> = {
  UNUSED: "未使用",
  USED: "已使用",
  EXPIRED: "已过期",
  DISABLED: "已停用"
};

export const notificationTypeText: Record<string, string> = {
  BOOKING_CREATED: "预约提交",
  BOOKING_CONFIRMED: "预约确认",
  BOOKING_CANCELLED: "预约取消",
  BOOKING_REMINDER: "到店提醒",
  MEMBERSHIP_RECHARGED: "会员充值",
  PACKAGE_CARD_ISSUED: "套餐卡到账",
  ORDER_PAID: "订单支付"
};

export const petTypeText: Record<string, string> = {
  CAT: "猫咪",
  DOG: "狗狗",
  OTHER: "其他"
};

export const sizeTypeText: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  LARGE: "大型",
  UNKNOWN: "不限"
};
