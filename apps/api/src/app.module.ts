import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./modules/ai/ai.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { FollowUpModule } from "./modules/follow-up/follow-up.module";
import { KnowledgeBaseModule } from "./modules/knowledge-base/knowledge-base.module";
import { MembershipsModule } from "./modules/memberships/memberships.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PetsModule } from "./modules/pets/pets.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { ServicesModule } from "./modules/services/services.module";
import { StatsModule } from "./modules/stats/stats.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AiModule,
    CouponsModule,
    KnowledgeBaseModule,
    FollowUpModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    PetsModule,
    ServicesModule,
    BookingsModule,
    OrdersModule,
    MembershipsModule,
    SettingsModule,
    StatsModule
  ]
})
export class AppModule {}
