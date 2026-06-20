import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PetType, SizeType } from "@petcare/shared";

export class ListServicesQueryDto {
  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @IsOptional()
  @IsEnum(SizeType)
  sizeType?: SizeType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : value === "true" || value === true))
  @IsBoolean()
  enabled?: boolean;
}

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsEnum(PetType)
  petType!: PetType;

  @IsEnum(SizeType)
  sizeType!: SizeType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notice?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @IsOptional()
  @IsEnum(SizeType)
  sizeType?: SizeType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notice?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateServiceEnabledDto {
  @IsBoolean()
  enabled!: boolean;
}
