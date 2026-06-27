import { Body, Controller, Post } from "@nestjs/common";
import { AiService } from "./ai.service";
import { BusinessAssistantDto, CustomerServiceChatDto, MarketingCopyDto } from "./dto";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("customer-service")
  customerService(@Body() body: CustomerServiceChatDto) {
    return this.aiService.customerService(body);
  }

  @Post("business-assistant")
  businessAssistant(@Body() body: BusinessAssistantDto) {
    return this.aiService.businessAssistant(body);
  }

  @Post("marketing-copy")
  marketingCopy(@Body() body: MarketingCopyDto) {
    return this.aiService.marketingCopy(body);
  }
}
