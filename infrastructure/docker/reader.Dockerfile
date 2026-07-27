FROM node:24.18.0-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/reader/package.json apps/reader/package.json
COPY packages/configuration/package.json packages/configuration/package.json
COPY packages/content-models/package.json packages/content-models/package.json
COPY packages/reader-engine/package.json packages/reader-engine/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-ui/package.json packages/shared-ui/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --frozen-lockfile

COPY apps/reader apps/reader
COPY packages packages
ARG VITE_APP_ENV=production
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter @followread/reader build

FROM nginx:1.28.3-alpine3.23 AS runtime
COPY infrastructure/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workspace/apps/reader/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:8080/healthz"]

