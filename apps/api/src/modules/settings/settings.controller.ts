import { Controller, Get } from "@nestjs/common";

const STORE_SETTINGS = {
  name: "宠伴管家示范店",
  businessHours: "09:00 - 18:00",
  address: "上海市宠物友好街 88 号",
  phone: "021-88886666",
  appointmentSlots: [
    "09:00 - 10:30",
    "10:30 - 12:00",
    "12:00 - 13:30",
    "13:30 - 15:00",
    "15:00 - 16:30",
    "16:30 - 18:00"
  ],
  notice: "请至少提前两小时预约，如需临时加急请联系门店。"
};

@Controller("settings")
export class SettingsController {
  @Get("store")
  store() {
    return STORE_SETTINGS;
  }
}
