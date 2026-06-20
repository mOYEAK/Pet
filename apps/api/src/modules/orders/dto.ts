import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "@petcare/shared";

export class ListOrdersQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
