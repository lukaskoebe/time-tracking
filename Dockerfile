FROM node:22-alpine AS base
RUN corepack enable pnpm

# ── Install dependencies ───────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Migration runner ───────────────────────────────────────────────────────────
# Includes full node_modules + source so drizzle-orm migrator works.
FROM deps AS migrate-runner
WORKDIR /app
COPY . .

# ── Production build ───────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build

# ── Lean production image ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.output ./.output
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
