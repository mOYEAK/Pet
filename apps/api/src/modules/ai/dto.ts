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

export class MarketingCopyDto {
  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  tone?: string;
}
