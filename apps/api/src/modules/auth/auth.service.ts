import { Injectable } from "@nestjs/common";
import { UserRole } from "@petcare/shared";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { MockLoginDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async mockLogin(input: MockLoginDto = {}) {
    return this.login({
      phone: input.phone ?? "18800000000",
      nickname: input.nickname ?? "咪咪主人",
      role: input.role ?? UserRole.Customer
    });
  }

  async adminLogin(input: MockLoginDto = {}) {
    return this.login({
      phone: input.phone ?? "19900000000",
      nickname: input.nickname ?? "门店管理员",
      role: UserRole.Admin
    });
  }

  private async login(input: Required<Pick<MockLoginDto, "phone" | "nickname" | "role">>) {
    const user = await this.prisma.user.upsert({
      where: { phone: input.phone },
      update: {
        nickname: input.nickname,
        role: input.role
      },
      create: {
        phone: input.phone,
        nickname: input.nickname,
        role: input.role
      }
    });

    return {
      accessToken: `mock-${user.role.toLowerCase()}-${user.id}`,
      user: serializeEntity(user)
    };
  }
}
