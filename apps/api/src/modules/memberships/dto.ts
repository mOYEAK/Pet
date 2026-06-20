import { IsOptional, IsString } from "class-validator";

export class ListMembershipsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
