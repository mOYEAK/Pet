import type {
  BookingStatus,
  OrderStatus,
  PackageCardStatus,
  PetGender,
  PetType,
  SizeType,
  UserRole
} from "./enums";

export interface UserDto {
  id: string;
  nickname?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}

export interface PetDto {
  id: string;
  userId: string;
  name: string;
  type: PetType;
  breed?: string;
  gender: PetGender;
  age?: number;
  weight?: number;
  isNeutered: boolean;
  notes?: string;
}

export interface ServiceDto {
  id: string;
  name: string;
  category: string;
  petType: PetType;
  sizeType: SizeType;
  basePrice: number;
  durationMinutes: number;
  description?: string;
  notice?: string;
  enabled: boolean;
}

export interface BookingDto {
  id: string;
  userId: string;
  petId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  remark?: string;
}

export interface OrderDto {
  id: string;
  bookingId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number;
  payMethod?: string;
  status: OrderStatus;
}

export interface MembershipDto {
  id: string;
  userId: string;
  level: string;
  balance: number;
  points: number;
}

export interface PackageCardDto {
  id: string;
  userId: string;
  serviceId: string;
  totalTimes: number;
  remainingTimes: number;
  expireDate?: string;
  status: PackageCardStatus;
}
