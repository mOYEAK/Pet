import { Controller, Get, Param, Query } from "@nestjs/common";
import { ListUsersQueryDto } from "./dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.usersService.getById(id);
  }
}
