# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=12.4.1
ARG PRISMA_VERSION=7.10.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ARG PNPM_VERSION
RUN npm install -g "pnpm@${PNPM_VERSION}"
ENV HUSKY=0 \
    NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch \
 && pnpm install --frozen-lockfile --offline

FROM deps AS builder
COPY . .
ENV SKIP_ENV_VALIDATION=true
RUN pnpm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ARG PRISMA_VERSION
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PATH="/opt/prisma/node_modules/.bin:$PATH" \
    NODE_PATH=/opt/prisma/node_modules

RUN apk add --no-cache libc6-compat openssl \
 && addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs \
 && mkdir -p /opt/prisma \
 && npm install "prisma@${PRISMA_VERSION}" --omit=dev --prefix /opt/prisma \
 && chown -R nextjs:nodejs /opt/prisma

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/auth/ok').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
