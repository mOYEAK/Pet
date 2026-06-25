import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateOrderFromBookingDto, ListOrdersQueryDto, PayOrderDto } from "./dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto) {
    return this.ordersService.list(query);
  }

  @Post("from-booking")
  createFromBooking(@Body() input: CreateOrderFromBookingDto) {
    return this.ordersService.createFromBooking(input);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.ordersService.getById(id);
  }

  @Patch(":id/pay")
  pay(@Param("id") id: string, @Body() input: PayOrderDto) {
    return this.ordersService.pay(id, input);
  }
}
