import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateKnowledgeBaseDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateKnowledgeBaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
