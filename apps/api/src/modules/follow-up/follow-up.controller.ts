import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ChurnRiskQueryDto, CreateFollowUpTaskDto, UpdateFollowUpTaskStatusDto } from "./dto";
import { FollowUpService } from "./follow-up.service";

@Controller("follow-up")
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Get("churn-risk")
  churnRisk(@Query() query: ChurnRiskQueryDto) {
    return this.followUpService.churnRisk(query);
  }

  @Get("tasks")
  listTasks() {
    return this.followUpService.listTasks();
  }

  @Post("tasks")
  createTask(@Body() body: CreateFollowUpTaskDto) {
    return this.followUpService.createTask(body);
  }

  @Patch("tasks/:id/status")
  updateTaskStatus(@Param("id") id: string, @Body() body: UpdateFollowUpTaskStatusDto) {
    return this.followUpService.updateTaskStatus(id, body);
  }
}
