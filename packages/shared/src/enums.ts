export enum UserRole {
  Customer = "CUSTOMER",
  Admin = "ADMIN"
}

export enum PetType {
  Cat = "CAT",
  Dog = "DOG",
  Other = "OTHER"
}

export enum PetGender {
  Male = "MALE",
  Female = "FEMALE",
  Unknown = "UNKNOWN"
}

export enum SizeType {
  Small = "SMALL",
  Medium = "MEDIUM",
  Large = "LARGE",
  Unknown = "UNKNOWN"
}

export enum BookingStatus {
  Pending = "PENDING",
  Confirmed = "CONFIRMED",
  Serving = "SERVING",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED"
}

export enum OrderStatus {
  PendingPayment = "PENDING_PAYMENT",
  Paid = "PAID",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
  Refunded = "REFUNDED"
}

export enum PackageCardStatus {
  Active = "ACTIVE",
  Expired = "EXPIRED",
  Disabled = "DISABLED"
}

export enum UserCouponStatus {
  Unused = "UNUSED",
  Used = "USED",
  Expired = "EXPIRED",
  Disabled = "DISABLED"
}

export enum NotificationType {
  BookingCreated = "BOOKING_CREATED",
  BookingConfirmed = "BOOKING_CONFIRMED",
  BookingCancelled = "BOOKING_CANCELLED",
  OrderPaid = "ORDER_PAID"
}
