import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreatePetDto, ListPetsQueryDto, UpdatePetDto } from "./dto";
import { PetsService } from "./pets.service";

@Controller("pets")
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  list(@Query() query: ListPetsQueryDto) {
    return this.petsService.list(query);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.petsService.getById(id);
  }

  @Post()
  create(@Body() body: CreatePetDto) {
    return this.petsService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdatePetDto) {
    return this.petsService.update(id, body);
  }
}
