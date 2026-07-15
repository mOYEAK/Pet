import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { IssuePackageCardDto, ListMembershipsQueryDto, ListRechargeRecordsQueryDto, RechargeMembershipDto } from "./dto";
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

  @Post("package-cards")
  issuePackageCard(@Body() body: IssuePackageCardDto) {
    return this.membershipsService.issuePackageCard(body);
  }

  @Get("recharge-records")
  listRechargeRecords(@Query() query: ListRechargeRecordsQueryDto) {
    return this.membershipsService.listRechargeRecords(query);
  }

  @Post("recharges")
  recharge(@Body() body: RechargeMembershipDto) {
    return this.membershipsService.recharge(body);
  }

  @Get("consumption-records")
  listConsumptionRecords(@Query("userId") userId?: string) {
    return this.membershipsService.listConsumptionRecords(userId);
  }

  @Get("by-user/:userId")
  async getByUserId(@Param("userId") userId: string, @Res() response: { json: (body: unknown) => unknown }) {
    const membership = await this.membershipsService.getByUserId(userId);
    return response.json(membership);
  }
}
