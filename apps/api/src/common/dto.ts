import { IsOptional, IsString } from "class-validator";

export class ListQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
