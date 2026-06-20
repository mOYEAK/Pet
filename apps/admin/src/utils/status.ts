export const bookingStatusText: Record<string, string> = {
  PENDING: "待确认",
  CONFIRMED: "已确认",
  SERVING: "服务中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

export const bookingStatusType: Record<string, "primary" | "success" | "info" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  SERVING: "success",
  COMPLETED: "info",
  CANCELLED: "danger"
};

export const orderStatusText: Record<string, string> = {
  PENDING_PAYMENT: "待支付",
  PAID: "已支付",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REFUNDED: "已退款"
};

export const packageCardStatusText: Record<string, string> = {
  ACTIVE: "有效",
  EXPIRED: "已过期",
  DISABLED: "已停用"
};

export const petTypeText: Record<string, string> = {
  CAT: "猫",
  DOG: "狗",
  OTHER: "其他"
};

export const sizeTypeText: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  LARGE: "大型",
  UNKNOWN: "不限"
};
