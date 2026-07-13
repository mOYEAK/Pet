import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { ListNotificationsQueryDto } from "./dto";

interface CreateNotificationInput {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  relatedType?: string;
  relatedId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListNotificationsQueryDto) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: query.userId },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(notifications);
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null
      }
    });

    return { count };
  }

  async markRead(id: string) {
    await this.ensureExists(id);

    const notification = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
      include: { user: true }
    });

    return serializeEntity(notification);
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: { readAt: new Date() }
    });

    return { count: result.count };
  }

  async create(input: CreateNotificationInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const notification = await client.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        content: input.content,
        type: input.type,
        relatedType: input.relatedType,
        relatedId: input.relatedId
      }
    });

    return serializeEntity(notification);
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.notification.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("通知不存在");
    }
  }
}
