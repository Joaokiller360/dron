FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

# Winston writes to logs/; create it for the unprivileged "node" user (app files stay root-owned)
RUN mkdir -p logs && chown node:node logs
USER node

EXPOSE 3001
# exec: node replaces the shell as PID 1 so it receives SIGTERM on redeploys
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main"]
