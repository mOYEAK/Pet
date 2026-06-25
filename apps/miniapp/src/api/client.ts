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
  totalAmount: number;
  paidAmount: number;
  payMethod: string | null;
  status: string;
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

function request<T>(path: string, method: "GET" | "POST" = "GET", data?: object): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method,
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
        const message = Array.isArray(body?.message)
          ? body?.message.join("，")
          : body?.message || `请求失败，状态码 ${statusCode}`;
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
  membership: (userId: string) => request<Membership>(`/memberships/by-user/${encodeURIComponent(userId)}`),
  consumptionRecords: (userId: string) =>
    request<ConsumptionRecord[]>(`/memberships/consumption-records?userId=${encodeURIComponent(userId)}`)
};
