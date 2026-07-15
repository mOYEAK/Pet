import { Module } from "@nestjs/common";
import { StatsModule } from "../stats/stats.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [StatsModule],
  controllers: [AiController],
  providers: [AiService]
})
export class AiModule {}
