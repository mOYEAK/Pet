import { Controller, Get, Query } from "@nestjs/common";
import { StatsOverviewQueryDto } from "./dto";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("dashboard")
  dashboard() {
    return this.statsService.dashboard();
  }

  @Get("overview")
  overview(@Query() query: StatsOverviewQueryDto) {
    return this.statsService.overview(query.period ?? "7d");
  }
}
