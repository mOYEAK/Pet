import { RechargePayMethod } from "@prisma/client";
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class ListMembershipsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ListRechargeRecordsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class RechargeMembershipDto {
  @IsString()
  userId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999.99)
  paidAmount!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  bonusAmount?: number;

  @IsEnum(RechargePayMethod)
  payMethod!: RechargePayMethod;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class IssuePackageCardDto {
  @IsString()
  userId!: string;

  @IsString()
  serviceId!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  totalTimes!: number;

  @IsOptional()
  @IsDateString({ strict: true })
  expireDate?: string;
}
