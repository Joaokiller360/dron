# GENERATED from back/Dockerfile by `npm run dockerfiles`: edit that file instead.
# One recipe for every service. Pick it with the APP build arg:
#   docker build --build-arg APP=store -t jbskylens-store .
# APP = gateway | auth | content | store | media | events
# apps/<service>/Dockerfile are copies of this file with APP preset, for hosts
# that can't pass build args (Dokploy: Docker File = back/apps/<service>/Dockerfile).
# Edit this file, then run `npm run dockerfiles`.
ARG APP=content

FROM node:20-alpine AS builder
ARG APP
RUN test -n "$APP" || (echo "No service selected. Use Docker File back/apps/<service>/Dockerfile (gateway|auth|content|store|media|events), or pass --build-arg APP=<service>" && exit 1)
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate && npx nest build "$APP"
# Only services with a database ship their Prisma schema + migrations
RUN mkdir -p out/prisma && if [ -d "apps/$APP/prisma" ]; then cp -r "apps/$APP/prisma/." out/prisma/; fi

FROM node:20-alpine AS runner
ARG APP
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Generated Prisma clients (built on this same Alpine/OpenSSL, so the engine matches)
COPY --from=builder /app/node_modules/@jbskylens ./node_modules/@jbskylens
COPY --from=builder /app/out/prisma ./prisma
COPY --from=builder /app/dist/apps/$APP ./dist

# Winston writes to logs/; create it for the unprivileged "node" user (app files stay root-owned)
RUN mkdir -p logs && chown node:node logs
USER node

# Every service listens on $PORT (3000 in docker-compose and Dokploy)
EXPOSE 3000
# Apply this service's migrations (if it has a database, and only through its
# own svc_<APP> role and schema), then run it
ENV APP=$APP
COPY scripts/start.sh ./start.sh
CMD ["sh", "start.sh"]
