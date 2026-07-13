const API_BASE = "/api";
const DEMO_PHONE = "18800000000";

export interface User {
  id: string;
  nickname: string | null;
  phone: string | null;
  role: string;
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
  pet?: Pet;
  service?: ServiceItem;
  order?: Order | null;
}

export interface Membership {
  id: string;
  userId: string;
  level: string;
  balance: number;
  points: number;
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
  coupon?: UserCoupon | null;
}

export interface ConsumptionRecord {
  id: string;
  userId: string;
  orderId: string | null;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export interface PackageCard {
  id: string;
  userId: string;
  serviceId: string;
  totalTimes: number;
  remainingTimes: number;
  expireDate: string | null;
  status: string;
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
}

export interface StoreSettings {
  name: string;
  businessHours: string;
  address: string;
  phone: string;
  appointmentSlots: string[];
  notice: string;
}

export interface AiCustomerServiceResponse {
  answer: string;
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  services: ServiceItem[];
}

export interface CreatePetPayload {
  userId: string;
  name: string;
  type: string;
  breed?: string;
  gender?: string;
  age?: number;
  weight?: number;
  isNeutered?: boolean;
  notes?: string;
}

export interface CreateBookingPayload {
  userId: string;
  petId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  remark?: string;
}

interface LoginResult {
  accessToken: string;
  user: User;
}

function request<T>(path: string, method: "GET" | "POST" | "PATCH" = "GET", data?: object): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: method as UniApp.RequestOptions["method"],
      data,
      header: {
        "Content-Type": "application/json"
      },
      success(response) {
        const statusCode = response.statusCode ?? 0;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(response.data as T);
          return;
        }

        const body = response.data as { message?: string | string[] } | undefined;
        const message = Array.isArray(body?.message) ? body.message.join("，") : body?.message || `请求失败，状态码 ${statusCode}`;
        reject(new Error(message));
      },
      fail(error) {
        reject(new Error(error.errMsg || "网络请求失败"));
      }
    });
  });
}

export function mockLogin() {
  return request<LoginResult>("/auth/mock-login", "POST", {
    phone: DEMO_PHONE,
    nickname: "咪咪主人"
  });
}

export async function getCurrentUser() {
  const result = await mockLogin();
  return result.user;
}

export const api = {
  services: () => request<ServiceItem[]>("/services"),
  pets: (userId: string) => request<Pet[]>(`/pets?userId=${encodeURIComponent(userId)}`),
  createPet: (payload: CreatePetPayload) => request<Pet>("/pets", "POST", payload),
  bookings: (userId: string) => request<Booking[]>(`/bookings?userId=${encodeURIComponent(userId)}`),
  createBooking: (payload: CreateBookingPayload) => request<Booking>("/bookings", "POST", payload),
  cancelBooking: (id: string) => request<Booking>(`/bookings/${id}/cancel`, "PATCH"),
  membership: (userId: string) => request<Membership>(`/memberships/by-user/${encodeURIComponent(userId)}`),
  packageCards: (userId: string) => request<PackageCard[]>(`/memberships/package-cards?userId=${encodeURIComponent(userId)}`),
  userCoupons: (userId: string) => request<UserCoupon[]>(`/coupons/user-coupons?userId=${encodeURIComponent(userId)}`),
  notifications: (userId: string) => request<NotificationItem[]>(`/notifications?userId=${encodeURIComponent(userId)}`),
  unreadNotifications: (userId: string) => request<{ count: number }>(`/notifications/unread-count?userId=${encodeURIComponent(userId)}`),
  markNotificationRead: (id: string) => request<NotificationItem>(`/notifications/${id}/read`, "PATCH"),
  markAllNotificationsRead: (userId: string) => request<{ count: number }>("/notifications/read-all", "PATCH", { userId }),
  consumptionRecords: (userId: string) =>
    request<ConsumptionRecord[]>(`/memberships/consumption-records?userId=${encodeURIComponent(userId)}`),
  storeSettings: () => request<StoreSettings>("/settings/store"),
  askCustomerService: (payload: { userId?: string; message: string }) =>
    request<AiCustomerServiceResponse>("/ai/customer-service", "POST", payload)
};
