import { Controller, Get, Param, Query } from "@nestjs/common";
import { ListOrdersQueryDto } from "./dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.list(query);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.ordersService.getById(id);
  }
}
