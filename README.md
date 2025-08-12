# cocos-backend

Backend service built with **NestJS**, **TypeScript**, and **TypeORM**. Uses **Yarn 4 (Berry)** for package management, **Jest** for testing, and optional **Docker** for containerized runs.

---

## Table of Contents

* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Environment](#environment)
* [Scripts](#scripts)

  * [Starts](#starts)
  * [Builds](#builds)
  * [Migrations](#migrations)
  * [Tests](#tests)
* [Docker](#docker)
* [Swagger / OpenAPI](#swagger--openapi)
* [Project Structure (suggested)](#project-structure-suggested)
* [Troubleshooting](#troubleshooting)
* [License](#license)
* [Contact](#contact)

---

## Prerequisites

* **Node.js**: 20+ recommended
* **Yarn**: This repo uses Yarn **4.5.3** (Berry). Activate via Corepack.
* **PostgreSQL** (for local DB + migrations)
* **Docker** (optional)

```bash
# Enable Corepack and activate the repo's Yarn version
corepack enable
corepack prepare yarn@4.5.3 --activate
```

---

## Getting Started

```bash
# 1) Install dependencies
yarn install

# 2) (Optional) Generate Swagger artifacts
yarn build:swagger

# 3) Create Local DB
docker compose up

# 4) Load Migrations
yarn migration:run

# 5) Start in dev mode (watch)
yarn start:dev
```

---

## Environment

This project uses a TypeORM data source at:

```
./src/config/postgres.ds.migration.provider.ts
```

Ensure your environment variables match what that file expects. A typical local setup might include:

```env
# .env 
NODE_ENV=local
PORT=3021

# Database 
DB_HOST=localhost
DB_PORT=5432
DB_USER=cocosServicesRoot
DB_PASS=root
DB_NAME=cocos_services

# TypeORM misc 
DB_SSL=false
DB_SYNC=false
```

---

## Scripts

### Starts

* **`yarn start`** – `nest start -w` (watch)
* **`yarn start:dev`** – `nest start --watch`
* **`yarn start:debug`** – `nest start --debug --watch`
* **`yarn start:prod`** – runs the compiled app: `node dist/main`
* **`yarn start:docker`** – `docker run -it --rm cocos-backend-repository`
* **`yarn start:docker:w`** – open a shell in the image: `docker run -it --rm cocos-backend-repository /bin/sh`

### Builds

* **`yarn build`** – compile TypeScript via Nest build
* **`yarn build:swagger`** – generate OpenAPI metadata via `ts-node ./src/common/swagger/generate-metadata.ts`
* **`yarn build:docker`** – build Docker image (`cocos-backend-repository`) with `STAGE=LOCAL`

### Migrations

> Migrations use the TypeORM CLI via `typeorm-ts-node-commonjs` and the data source at `./src/config/postgres.ds.migration.provider.ts`.

* **Generate**

```bash
# Pass a descriptive name for the migration file
yarn migration:gen AddUsersTable
```

  This runs a build and then:

```bash
yarn typeorm migration:generate ./src/common/migration/AddUsersTable -d ./src/config/postgres.ds.migration.provider.ts
```

* **Run**

```bash
yarn migration:run
```

- **Revert (one step)**

```bash
yarn migration:revert
````

### Tests

* **`yarn test`** – unit tests
* **`yarn test:watch`** – watch mode
* **`yarn test:cov`** – coverage
* **`yarn test:debug`** – debug tests with Node inspector
* **`yarn test:e2e`** – end-to-end tests (`./test/jest-e2e.json`)

---

## Docker

```bash
# Build the image
yarn build:docker

# Run the image (default CMD)
yarn start:docker

# Inspect the image interactively
yarn start:docker:w
```

---

## Swagger / OpenAPI

The command below generates OpenAPI artifacts as defined in `./src/common/swagger/generate-metadata.ts`:

```bash
yarn build:swagger
```


