import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto, UpdateServiceEnabledDto } from "./dto";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  list(@Query() query: ListServicesQueryDto) {
    return this.servicesService.list(query);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.servicesService.getById(id);
  }

  @Post()
  create(@Body() body: CreateServiceDto) {
    return this.servicesService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateServiceDto) {
    return this.servicesService.update(id, body);
  }

  @Patch(":id/enabled")
  setEnabled(@Param("id") id: string, @Body() body: UpdateServiceEnabledDto) {
    return this.servicesService.setEnabled(id, body.enabled);
  }
}
