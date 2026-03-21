# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (substitua pelos seus valores reais no CI/CD)
ARG NEXT_PUBLIC_BACK4APP_APP_ID
ARG NEXT_PUBLIC_BACK4APP_JS_KEY
ARG NEXT_PUBLIC_BACK4APP_SERVER_URL=https://parseapi.back4app.com
ARG NEXT_PUBLIC_MAILBOXLAYER_KEY

ENV NEXT_PUBLIC_BACK4APP_APP_ID=$NEXT_PUBLIC_BACK4APP_APP_ID
ENV NEXT_PUBLIC_BACK4APP_JS_KEY=$NEXT_PUBLIC_BACK4APP_JS_KEY
ENV NEXT_PUBLIC_BACK4APP_SERVER_URL=$NEXT_PUBLIC_BACK4APP_SERVER_URL
ENV NEXT_PUBLIC_MAILBOXLAYER_KEY=$NEXT_PUBLIC_MAILBOXLAYER_KEY

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ─── Stage 3: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
