# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install nest CLI for the build step
RUN npm install -g @nestjs/cli

# Copy package files first for better layer caching
COPY server/package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and config
COPY server/tsconfig.json server/nest-cli.json ./
COPY server/src/ src/
COPY server/database/ database/

# Build the application
RUN nest build

# ---- Production stage ----
FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production-only dependencies
COPY server/package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy compiled output and migration files from the build stage
COPY --from=build /app/dist/ dist/
COPY --from=build /app/database/ database/

# Run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3002

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]
