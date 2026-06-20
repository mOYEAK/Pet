import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PetGender, PetType } from "@petcare/shared";

export class ListPetsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreatePetDto {
  @IsString()
  userId!: string;

  @IsString()
  name!: string;

  @IsEnum(PetType)
  type!: PetType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
