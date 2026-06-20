import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { MembershipsModule } from "./modules/memberships/memberships.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PetsModule } from "./modules/pets/pets.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ServicesModule } from "./modules/services/services.module";
import { StatsModule } from "./modules/stats/stats.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PetsModule,
    ServicesModule,
    BookingsModule,
    OrdersModule,
    MembershipsModule,
    StatsModule
  ]
})
export class AppModule {}
