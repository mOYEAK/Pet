import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MockLoginDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("mock-login")
  mockLogin(@Body() body: MockLoginDto) {
    return this.authService.mockLogin(body);
  }

  @Post("admin-login")
  adminLogin(@Body() body: MockLoginDto) {
    return this.authService.adminLogin(body);
  }
}
