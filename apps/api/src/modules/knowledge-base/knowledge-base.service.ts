import { Injectable, NotFoundException } from "@nestjs/common";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from "./dto";

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.knowledgeBase.findMany({
      orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }]
    });

    return serializeEntity(items);
  }

  async create(input: CreateKnowledgeBaseDto) {
    const item = await this.prisma.knowledgeBase.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category,
        enabled: input.enabled ?? true
      }
    });

    return serializeEntity(item);
  }

  async update(id: string, input: UpdateKnowledgeBaseDto) {
    await this.ensureExists(id);
    const item = await this.prisma.knowledgeBase.update({
      where: { id },
      data: input
    });

    return serializeEntity(item);
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.knowledgeBase.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("知识库内容不存在");
    }
  }
}
