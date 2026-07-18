import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/modules/prisma/prisma.service";

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
}

export function assertIsolatedTestDatabase(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required for API integration tests");

  const url = new URL(databaseUrl);
  const isLocalHost = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (!isLocalHost || url.port !== "5433" || url.pathname !== "/petcare_test") {
    throw new Error(
      `Refusing to reset database ${url.hostname}:${url.port}${url.pathname}; expected localhost:5433/petcare_test`
    );
  }
}

export async function createTestApp(): Promise<TestContext> {
  assertIsolatedTestDatabase();
  process.env.NODE_ENV = "test";
  process.env.AI_ENABLED = "false";
  process.env.BOOKING_REMINDER_ENABLED = "false";

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  return { app, prisma: app.get(PrismaService) };
}

export async function resetTestDatabase(prisma: PrismaService) {
  assertIsolatedTestDatabase();
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "notifications",
      "ai_conversations",
      "follow_up_tasks",
      "recharge_records",
      "consumption_records",
      "package_cards",
      "memberships",
      "orders",
      "bookings",
      "user_coupons",
      "coupon_templates",
      "pets",
      "services",
      "knowledge_base",
      "users"
    RESTART IDENTITY CASCADE
  `);
}
