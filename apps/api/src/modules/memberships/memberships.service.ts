import { Injectable, NotFoundException } from "@nestjs/common";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { ListMembershipsQueryDto } from "./dto";

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListMembershipsQueryDto) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId: query.userId },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(memberships);
  }

  async getByUserId(userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    return serializeEntity(membership);
  }

  async listPackageCards(userId?: string) {
    const packageCards = await this.prisma.packageCard.findMany({
      where: { userId },
      include: {
        user: true,
        service: true
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(packageCards);
  }

  async listConsumptionRecords(userId?: string) {
    const records = await this.prisma.consumptionRecord.findMany({
      where: { userId },
      include: {
        user: true,
        order: true
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(records);
  }
}
