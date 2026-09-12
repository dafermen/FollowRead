FROM node:24.18.0-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/admin-web/package.json apps/admin-web/package.json
COPY packages/configuration/package.json packages/configuration/package.json
COPY packages/content-models/package.json packages/content-models/package.json
COPY packages/reader-engine/package.json packages/reader-engine/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-ui/package.json packages/shared-ui/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --frozen-lockfile

COPY apps/admin-web apps/admin-web
COPY docs docs
COPY packages packages
ARG VITE_BASE_PATH=/
ARG FOLLOWREAD_DOCS_BASE=/docs/
ARG VITE_READER_BASE_URL=http://localhost:5174
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV FOLLOWREAD_DOCS_BASE=$FOLLOWREAD_DOCS_BASE
ENV FOLLOWREAD_DOCS_NO_GIT=1
ENV VITE_READER_BASE_URL=$VITE_READER_BASE_URL
ARG VITE_APP_ENV=production
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter @followread/admin-web build

FROM nginx:1.30.4-alpine3.24 AS runtime
RUN apk add --no-cache 'libuuid>=2.42.3-r1'
COPY infrastructure/docker/nginx.conf /etc/nginx/nginx.conf
COPY infrastructure/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=builder /workspace/apps/admin-web/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:8080/healthz"]

USER nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]
