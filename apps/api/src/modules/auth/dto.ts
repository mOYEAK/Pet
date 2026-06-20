import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "@petcare/shared";

export class MockLoginDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
