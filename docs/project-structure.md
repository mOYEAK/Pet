# Project Structure

## Monorepo Layout

```text
petcare-system/
  apps/
    admin/      Vue 3 merchant dashboard
    miniapp/    uni-app customer mini program
    api/        NestJS API service
  packages/
    shared/     shared domain types, enums, helpers
    agent/      AI prompts and tool wrappers
  docs/         project notes
```

## MVP Boundaries

P0 first:

- Auth and simulated login
- Pet profiles
- Service catalog
- Booking creation and conflict checks
- Merchant booking management
- Service management
- Customer management
- Orders
- Membership and package cards
- Basic statistics

P2 agent features stay isolated in `packages/agent` until the core flow is stable.

## Backend Module Map

- `auth`: login and identity context
- `users`: customers and merchant admin users
- `pets`: pet profiles
- `services`: service catalog
- `bookings`: appointment lifecycle and conflict checks
- `orders`: payment records and order status
- `memberships`: balance, points, and package cards
- `stats`: dashboard metrics
- `prisma`: database access provider

## Shared Domain

`packages/shared` owns cross-app contracts such as:

- user roles
- pet type and size type
- booking and order statuses
- service, pet, booking, order, membership DTO shapes

Keep request/response types here only when they are reused by more than one app.
