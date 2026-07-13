import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CouponsService } from "./coupons.service";
import { CreateCouponTemplateDto, IssueCouponDto, UpdateCouponTemplateDto } from "./dto";

@Controller("coupons")
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get("templates")
  listTemplates() {
    return this.couponsService.listTemplates();
  }

  @Post("templates")
  createTemplate(@Body() input: CreateCouponTemplateDto) {
    return this.couponsService.createTemplate(input);
  }

  @Patch("templates/:id")
  updateTemplate(@Param("id") id: string, @Body() input: UpdateCouponTemplateDto) {
    return this.couponsService.updateTemplate(id, input);
  }

  @Post("issue")
  issue(@Body() input: IssueCouponDto) {
    return this.couponsService.issue(input);
  }

  @Get("user-coupons")
  listUserCoupons(@Query("userId") userId?: string) {
    return this.couponsService.listUserCoupons(userId);
  }
}
