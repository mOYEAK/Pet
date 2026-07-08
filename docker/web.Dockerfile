FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/miniapp/package.json apps/miniapp/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/admin apps/admin
COPY apps/miniapp apps/miniapp

ENV VITE_BASE_PATH=/admin/

RUN pnpm --filter @petcare/admin build \
  && pnpm --filter @petcare/miniapp build:h5

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/miniapp/dist/build/h5 /usr/share/nginx/html
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html/admin

EXPOSE 80
