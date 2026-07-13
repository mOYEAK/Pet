import { IsOptional, IsString } from "class-validator";

export class ListNotificationsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ReadAllNotificationsDto {
  @IsString()
  userId!: string;
}
