import { IsIn, IsOptional } from "class-validator";
import type { StatsPeriodKey } from "./stats.service";

export class StatsOverviewQueryDto {
  @IsOptional()
  @IsIn(["7d", "30d", "month"])
  period?: StatsPeriodKey;
}
