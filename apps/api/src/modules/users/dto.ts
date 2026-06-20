import { IsEnum, IsOptional } from "class-validator";
import { UserRole } from "@petcare/shared";

export class ListUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
