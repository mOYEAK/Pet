import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from "./dto";
import { KnowledgeBaseService } from "./knowledge-base.service";

@Controller("knowledge-base")
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  list() {
    return this.knowledgeBaseService.list();
  }

  @Post()
  create(@Body() body: CreateKnowledgeBaseDto) {
    return this.knowledgeBaseService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateKnowledgeBaseDto) {
    return this.knowledgeBaseService.update(id, body);
  }
}
