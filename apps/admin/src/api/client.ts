export interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  todayRevenue: number;
  newCustomers: number;
  popularServices: Array<{
    id: string;
    name: string;
    bookingCount: number;
  }>;
}

export interface User {
  id: string;
  nickname: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  pets?: Pet[];
  bookings?: Booking[];
  orders?: Order[];
  membership?: Membership | null;
  packageCards?: PackageCard[];
  userCoupons?: UserCoupon[];
  consumptionRecords?: ConsumptionRecord[];
  rechargeRecords?: RechargeRecord[];
  followUpTasks?: FollowUpTask[];
  notifications?: NotificationItem[];
  lastActivityAt?: string | null;
  inactiveDays?: number | null;
  recallMessage?: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string;
  age: number | null;
  weight: number | null;
  isNeutered: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  bookings?: Booking[];
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  petType: string;
  sizeType: string;
  basePrice: number;
  durationMinutes: number;
  description: string | null;
  notice: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  petId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  pet?: Pet;
  service?: ServiceItem;
  order?: Order | null;
}

export interface CreateBookingPayload {
  userId: string;
  petId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  remark?: string;
  status?: string;
}

export interface Order {
  id: string;
  bookingId: string;
  userId: string;
  couponId: string | null;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  payMethod: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  booking?: Booking;
  coupon?: UserCoupon | null;
  consumptionRecords?: ConsumptionRecord[];
}

export interface Membership {
  id: string;
  userId: string;
  level: string;
  balance: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ConsumptionRecord {
  id: string;
  userId: string;
  orderId: string | null;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
  user?: User;
  order?: Order | null;
}

export interface RechargeRecord {
  id: string;
  userId: string;
  paidAmount: number;
  bonusAmount: number;
  creditedAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  payMethod: string;
  remark: string | null;
  createdAt: string;
  user?: User;
}

export interface PackageCard {
  id: string;
  userId: string;
  serviceId: string;
  totalTimes: number;
  remainingTimes: number;
  expireDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  service?: ServiceItem;
}

export interface CouponTemplate {
  id: string;
  name: string;
  thresholdAmount: number;
  discountAmount: number;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userCoupons: number;
  };
}

export interface UserCoupon {
  id: string;
  templateId: string;
  userId: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  template?: CouponTemplate;
  user?: User;
  usedOrder?: Order | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  relatedType: string | null;
  relatedId: string | null;
  readAt: string | null;
  createdAt: string;
  user?: User;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAssistantResponse {
  answer: string;
  data: {
    todayRevenue: number;
    monthRevenue: number;
    todayBookings: number;
    monthBookings: number;
    pendingBookings: number;
    customers: number;
    memberConsumption: number;
    popularServices: Array<{
      id: string;
      name: string;
      bookingCount: number;
    }>;
  };
}

export interface FollowUpTask {
  id: string;
  userId: string;
  title: string;
  content: string | null;
  status: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface LoginResult {
  accessToken: string;
  user: User;
}

export interface StoreSettings {
  name: string;
  businessHours: string;
  address: string;
  phone: string;
  appointmentSlots: string[];
  notice: string;
}

export interface MarketingCopyResponse {
  copy: string;
  channel: string;
  tone: string;
  services: ServiceItem[];
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface ServicePayload {
  name: string;
  category: string;
  petType: string;
  sizeType: string;
  basePrice: number;
  durationMinutes: number;
  description?: string;
  notice?: string;
  enabled?: boolean;
}

export interface KnowledgeBasePayload {
  title: string;
  content: string;
  category?: string;
  enabled?: boolean;
}

export interface CouponTemplatePayload {
  name: string;
  thresholdAmount: number;
  discountAmount: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  enabled?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? `请求失败，状态码 ${response.status}`;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return (await response.json()) as T;
}

export const api = {
  adminLogin: (payload: { phone: string; nickname?: string }) =>
    request<LoginResult>("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  dashboard: () => request<DashboardStats>("/api/stats/dashboard"),
  services: () => request<ServiceItem[]>("/api/services"),
  createService: (payload: ServicePayload) =>
    request<ServiceItem>("/api/services", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateService: (id: string, payload: Partial<ServicePayload>) =>
    request<ServiceItem>(`/api/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  setServiceEnabled: (id: string, enabled: boolean) =>
    request<ServiceItem>(`/api/services/${id}/enabled`, {
      method: "PATCH",
      body: JSON.stringify({ enabled })
    }),
  bookings: () => request<Booking[]>("/api/bookings"),
  createBooking: (payload: CreateBookingPayload) =>
    request<Booking>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBookingStatus: (id: string, status: string) =>
    request<Booking>(`/api/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  cancelBooking: (id: string) =>
    request<Booking>(`/api/bookings/${id}/cancel`, {
      method: "PATCH"
    }),
  createOrderFromBooking: (bookingId: string) =>
    request<Order>("/api/orders/from-booking", {
      method: "POST",
      body: JSON.stringify({ bookingId })
    }),
  users: () => request<User[]>("/api/users"),
  user: (id: string) => request<User>(`/api/users/${id}`),
  pets: () => request<Pet[]>("/api/pets"),
  orders: () => request<Order[]>("/api/orders"),
  payOrder: (id: string, payload: { payMethod: string; paidAmount?: number; packageCardId?: string; couponId?: string }) =>
    request<Order>(`/api/orders/${id}/pay`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  couponTemplates: () => request<CouponTemplate[]>("/api/coupons/templates"),
  createCouponTemplate: (payload: CouponTemplatePayload) =>
    request<CouponTemplate>("/api/coupons/templates", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCouponTemplate: (id: string, payload: Partial<CouponTemplatePayload>) =>
    request<CouponTemplate>(`/api/coupons/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  issueCoupon: (payload: { templateId: string; userId: string }) =>
    request<UserCoupon>("/api/coupons/issue", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  userCoupons: (userId?: string) => request<UserCoupon[]>(`/api/coupons/user-coupons${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),
  notifications: (userId?: string) => request<NotificationItem[]>(`/api/notifications${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),
  unreadNotifications: (userId: string) => request<{ count: number }>(`/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/api/notifications/${id}/read`, {
      method: "PATCH"
    }),
  markAllNotificationsRead: (userId: string) =>
    request<{ count: number }>("/api/notifications/read-all", {
      method: "PATCH",
      body: JSON.stringify({ userId })
    }),
  consumptionRecords: () => request<ConsumptionRecord[]>("/api/memberships/consumption-records"),
  rechargeRecords: (userId?: string) =>
    request<RechargeRecord[]>(`/api/memberships/recharge-records${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),
  rechargeMembership: (payload: { userId: string; paidAmount: number; bonusAmount?: number; payMethod: string; remark?: string }) =>
    request<{ membership: Membership; rechargeRecord: RechargeRecord }>("/api/memberships/recharges", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  memberships: () => request<Membership[]>("/api/memberships"),
  packageCards: (userId?: string) => request<PackageCard[]>(`/api/memberships/package-cards${userId ? `?userId=${userId}` : ""}`),
  issuePackageCard: (payload: { userId: string; serviceId: string; totalTimes: number; expireDate?: string }) =>
    request<PackageCard>("/api/memberships/package-cards", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  knowledgeBase: () => request<KnowledgeBaseItem[]>("/api/knowledge-base"),
  createKnowledgeBase: (payload: KnowledgeBasePayload) =>
    request<KnowledgeBaseItem>("/api/knowledge-base", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateKnowledgeBase: (id: string, payload: Partial<KnowledgeBasePayload>) =>
    request<KnowledgeBaseItem>(`/api/knowledge-base/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  businessAssistant: (message: string) =>
    request<BusinessAssistantResponse>("/api/ai/business-assistant", {
      method: "POST",
      body: JSON.stringify({ message })
    }),
  churnRiskCustomers: (days: number) => request<User[]>(`/api/follow-up/churn-risk?days=${days}`),
  followUpTasks: () => request<FollowUpTask[]>("/api/follow-up/tasks"),
  createFollowUpTask: (payload: { userId: string; title: string; content?: string; dueDate?: string }) =>
    request<FollowUpTask>("/api/follow-up/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateFollowUpTaskStatus: (id: string, status: string) =>
    request<FollowUpTask>(`/api/follow-up/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  storeSettings: () => request<StoreSettings>("/api/settings/store"),
  marketingCopy: (payload: { topic: string; channel?: string; tone?: string }) =>
    request<MarketingCopyResponse>("/api/ai/marketing-copy", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
