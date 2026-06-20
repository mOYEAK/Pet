import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { CreateBookingDto, ListBookingsQueryDto, UpdateBookingStatusDto } from "./dto";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  list(@Query() query: ListBookingsQueryDto) {
    return this.bookingsService.list(query);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.bookingsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateBookingDto) {
    return this.bookingsService.create(body);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, body.status as BookingStatus);
  }

  @Patch(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.bookingsService.cancel(id);
  }
}
