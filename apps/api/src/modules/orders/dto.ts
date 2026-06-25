import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { OrderStatus } from "@petcare/shared";

export class ListOrdersQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class CreateOrderFromBookingDto {
  @IsString()
  bookingId!: string;
}

export class PayOrderDto {
  @IsString()
  payMethod!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount?: number;
}
