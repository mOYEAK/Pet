import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ListNotificationsQueryDto, ReadAllNotificationsDto } from "./dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Query() query: ListNotificationsQueryDto) {
    return this.notificationsService.list(query);
  }

  @Get("unread-count")
  unreadCount(@Query("userId") userId: string) {
    return this.notificationsService.unreadCount(userId);
  }

  @Patch("read-all")
  markAllRead(@Body() body: ReadAllNotificationsDto) {
    return this.notificationsService.markAllRead(body.userId);
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string) {
    return this.notificationsService.markRead(id);
  }
}
