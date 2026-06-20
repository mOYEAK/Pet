import { IsEnum, IsOptional, IsString } from "class-validator";
import { BookingStatus } from "@petcare/shared";

export class ListBookingsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateBookingDto {
  @IsString()
  userId!: string;

  @IsString()
  petId!: string;

  @IsString()
  serviceId!: string;

  @IsString()
  bookingDate!: string;

  @IsString()
  startTime!: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
