import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCouponTemplateDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thresholdAmount!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discountAmount!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateCouponTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thresholdAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discountAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class IssueCouponDto {
  @IsString()
  templateId!: string;

  @IsString()
  userId!: string;
}
