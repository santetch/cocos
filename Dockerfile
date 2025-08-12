# === Stage 1: Build Library ("builder") ===
FROM node:23-alpine AS builder
WORKDIR /usr/src/app

# Copy workspace configuration and dependency files.
COPY package.json yarn.lock tsconfig.json .yarnrc.yml ./

# Enable Corepack and prepare Yarn (v4.5.3).
RUN corepack enable 
RUN corepack prepare yarn@4.5.3 --activate

# Install project dependencies.
RUN  yarn install

# === Stage 2: Build Target Service ("build-services") ===
FROM node:23-alpine AS build-services
WORKDIR /usr/src/app

# Copy workspace configuration files.
COPY package.json yarn.lock tsconfig.json .yarnrc.yml ./

# Enable Corepack and set up Yarn.
RUN corepack enable
RUN corepack prepare yarn@4.5.3 --activate

# Copy the service source code.
COPY / ./

# Install dependencies for the service.
RUN yarn install

# Build the 'cocos-backend' service.
RUN yarn build

# === Stage 3: Runtime ("runner") ===
#FROM node:22-alpine AS runner
FROM node:23-alpine AS runner
WORKDIR /usr/src/app

# Optionally, pass build stage info (if needed by your application).
ARG STAGE

# Enable Corepack and prepare Yarn for runtime.
RUN corepack enable
RUN corepack prepare yarn@4.5.3 --activate

# Copy the built service and its dependencies.
COPY --from=build-services /usr/src/app/ .

# Expose the service port.
EXPOSE 3021
ENV PORT 3021

# Run migrations before starting the service.
# Start the 'cocos-backend' service.
# If the migration step fails, the container will exit without starting the service.
CMD ["sh", "-c", "yarn migration:run && yarn start"]

