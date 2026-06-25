import { Injectable, NotFoundException } from "@nestjs/common";
import { PetGender, PetType, Prisma } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePetDto, ListPetsQueryDto, UpdatePetDto } from "./dto";

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListPetsQueryDto) {
    const pets = await this.prisma.pet.findMany({
      where: { userId: query.userId },
      include: {
        user: true,
        bookings: {
          include: {
            service: true,
            order: true
          },
          orderBy: { startTime: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(pets);
  }

  async getById(id: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        user: true,
        bookings: {
          include: {
            service: true,
            order: true
          },
          orderBy: { startTime: "desc" }
        }
      }
    });

    if (!pet) {
      throw new NotFoundException("宠物档案不存在");
    }

    return serializeEntity(pet);
  }

  async create(input: CreatePetDto) {
    const pet = await this.prisma.pet.create({
      data: this.toCreateData(input),
      include: { user: true }
    });

    return serializeEntity(pet);
  }

  async update(id: string, input: UpdatePetDto) {
    await this.ensureExists(id);

    const pet = await this.prisma.pet.update({
      where: { id },
      data: this.toUpdateData(input),
      include: { user: true }
    });

    return serializeEntity(pet);
  }

  private toCreateData(input: CreatePetDto): Prisma.PetUncheckedCreateInput {
    return {
      ...input,
      type: input.type as PetType,
      gender: (input.gender ?? "UNKNOWN") as PetGender,
      isNeutered: input.isNeutered ?? false
    };
  }

  private toUpdateData(input: UpdatePetDto): Prisma.PetUncheckedUpdateInput {
    return {
      ...input,
      type: input.type as PetType | undefined,
      gender: input.gender as PetGender | undefined
    };
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.pet.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("宠物档案不存在");
    }
  }
}
