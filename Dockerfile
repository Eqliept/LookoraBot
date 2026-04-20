FROM node:22-slim AS deps

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lookora
ENV DATABASE_URL=${DATABASE_URL}

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate \
    && npm run build \
    && npm prune --omit=dev

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/dist ./dist
COPY --from=deps /app/prisma ./prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
