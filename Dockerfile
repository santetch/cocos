# === Stage 1: Build Library ("builder") ===
FROM public.ecr.aws/s2k0c6k5/spp/sync-service-base:latest AS builder
WORKDIR /usr/src/app

# Copy workspace configuration and dependency files.
COPY package.json yarn.lock nx.json tsconfig.json .yarnrc.yml ./

# Enable Corepack and prepare Yarn (v4.5.3).
RUN corepack enable 
RUN corepack prepare yarn@4.5.3 --activate

# Copy the neccessary libs
COPY libs/drivers/linux ./libs/drivers
COPY libs/communication-contracts ./libs/communication-contracts

# Install Nx CLI and project dependencies.
RUN yarn add nx && yarn install

# Build the 'communication-contracts' library.
RUN yarn nx run @esquire-makingsense/communication-contracts:build

# === Stage 2: Build Target Service ("build-services") ===
FROM public.ecr.aws/s2k0c6k5/spp/sync-service-base:latest AS build-services
WORKDIR /usr/src/app

# Copy workspace configuration files.
COPY package.json yarn.lock nx.json tsconfig.json .yarnrc.yml ./

# Enable Corepack and set up Yarn.
RUN corepack enable
RUN corepack prepare yarn@4.5.3 --activate

# Copy the necessary libs
COPY --from=builder /usr/src/app/libs/drivers/NQjc.jar ./libs/drivers/
COPY --from=builder /usr/src/app/libs/communication-contracts/src ./libs/communication-contracts/src
COPY --from=builder /usr/src/app/libs/communication-contracts/package.json ./libs/communication-contracts/

# Copy the microservice source code.
COPY /services/microservices/sync-service ./services/microservices/sync-service

# Install Java JDK and JRE
RUN apt-get update && apt-get install default-jre -y && apt-get install default-jdk -y

# Install dependencies for the service.
RUN yarn install

# Build the 'sync-service' microservice.
RUN yarn nx run sync-service:build

# === Stage 3: Runtime ("runner") ===
FROM public.ecr.aws/s2k0c6k5/spp/sync-service-base:latest AS runner
WORKDIR /usr/src/app

# Export Java Path
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV LD_LIBRARY_PATH=$JAVA_HOME/lib/server

# Optionally, pass build stage info (if needed by your application).
ARG STAGE

# Enable Corepack and prepare Yarn for runtime.
RUN corepack enable
RUN corepack prepare yarn@4.5.3 --activate

# Copy the built service and its dependencies.
COPY --from=build-services /usr/src/app/ .

# Expose the service port.
EXPOSE 3022
ENV PORT 3022

# Start the 'sync-service' microservice.
CMD ["yarn", "nx", "start", "sync-service"]
