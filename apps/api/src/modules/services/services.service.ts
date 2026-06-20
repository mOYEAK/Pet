import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PetType, SizeType } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto, ListServicesQueryDto, UpdateServiceDto } from "./dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListServicesQueryDto) {
    const where: Prisma.ServiceWhereInput = {
      petType: query.petType as PetType | undefined,
      sizeType: query.sizeType as SizeType | undefined,
      category: query.category,
      enabled: query.enabled
    };

    const services = await this.prisma.service.findMany({
      where,
      orderBy: [{ enabled: "desc" }, { createdAt: "desc" }]
    });

    return serializeEntity(services);
  }

  async getById(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    return serializeEntity(service);
  }

  async create(input: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        ...input,
        petType: input.petType as PetType,
        sizeType: input.sizeType as SizeType
      }
    });

    return serializeEntity(service);
  }

  async update(id: string, input: UpdateServiceDto) {
    await this.ensureExists(id);

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        ...input,
        petType: input.petType as PetType | undefined,
        sizeType: input.sizeType as SizeType | undefined
      }
    });

    return serializeEntity(service);
  }

  async setEnabled(id: string, enabled: boolean) {
    return this.update(id, { enabled });
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.service.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("Service not found");
    }
  }
}
