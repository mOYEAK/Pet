import { Controller, Get, Param, Query } from "@nestjs/common";
import { ListMembershipsQueryDto } from "./dto";
import { MembershipsService } from "./memberships.service";

@Controller("memberships")
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  list(@Query() query: ListMembershipsQueryDto) {
    return this.membershipsService.list(query);
  }

  @Get("package-cards")
  listPackageCards(@Query("userId") userId?: string) {
    return this.membershipsService.listPackageCards(userId);
  }

  @Get("consumption-records")
  listConsumptionRecords(@Query("userId") userId?: string) {
    return this.membershipsService.listConsumptionRecords(userId);
  }

  @Get("by-user/:userId")
  getByUserId(@Param("userId") userId: string) {
    return this.membershipsService.getByUserId(userId);
  }
}
