import { IsOptional, IsString } from "class-validator";

export class CustomerServiceChatDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class BusinessAssistantDto {
  @IsString()
  message!: string;
}
