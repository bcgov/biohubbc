#!make

# ------------------------------------------------------------------------------
# Makefile -- BioHubBC
# ------------------------------------------------------------------------------

-include .env

# Apply the contents of the .env to the terminal, so that the docker-compose file can use them in its builds
export $(shell sed 's/=.*//' .env)

.DEFAULT : help
.PHONY : setup close clean build run run-debug build-backend run-backend run-backend-debug build-web run-web run-web-debug database app api db-setup db-migrate db-rollback install test lint lint-fix format help

## ------------------------------------------------------------------------------
## Alias Commands
## - Performs logical groups of commands for your convenience
## ------------------------------------------------------------------------------

# Running the docker build
# 1. Run `make env`
# 2. Edit the `.env` file as needed to update variables and  secrets
# 3. Run `make local` or `make local-debug`

env: | setup ## Copies the default ./env_config/env.docker to ./.env

all: | close build run ## Performs all commands necessary to run all projects in docker
all-debug: | close build run-debug ## Performs all commands necessary to run all projects in docker in debug mode

postgres: | close build-postgres run-postgres ## Performs all commands necessary to run the postgres db project in docker
postgres-debug: | close build-postgres run-postgres-debug ## Performs all commands necessary to run the postgres db project in docker in debug mode

backend: | close build-backend run-backend ## Performs all commands necessary to run all backend projects in docker
backend-debug: | close build-backend run-backend-debug ## Performs all commands necessary to run all backend projects in docker in debug mode

web: | close build-web run-web ## Performs all commands necessary to run all backend+web projects in docker
web-debug: | close build-web run-web-debug ## Performs all commands necessary to run all backend+web projects in docker in debug mode

db-setup: | build-db-setup run-db-setup ## Performs all commands necessary to run the database migrations and seeding
db-migrate: | build-db-migrate run-db-migrate ## Performs all commands necessary to run the database migrations
db-rollback: | build-db-rollback run-db-rollback ## Performs all commands necessary to rollback the latest database migrations

n8n-setup: | build-n8n-setup run-n8n-setup ## Performs all commands necessary to run the n8n setup

## ------------------------------------------------------------------------------
## Setup/Cleanup Commands
## ------------------------------------------------------------------------------

setup: ## Prepares the environment variables used by all project docker containers
	@echo "==============================================="
	@echo "Make: setup - copying env.docker to .env"
	@echo "==============================================="
	@cp -i env_config/env.docker .env

close: ## Closes all project containers
	@echo "==============================================="
	@echo "Make: close - closing Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down

clean: ## Closes and cleans (removes) all project containers
	@echo "==============================================="
	@echo "Make: clean - closing and cleaning Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans

## ------------------------------------------------------------------------------
## Build/Run Backend+Frontend Commands
## - Builds all of the biohub projects (db, db_setup, api, app)
## ------------------------------------------------------------------------------

build: ## Builds all project containers
	@echo "==============================================="
	@echo "Make: build - building all project images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build

run: ## Runs all project containers
	@echo "==============================================="
	@echo "Make: run - running all project images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d

run-debug: ## Runs all project containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-debug - running all project images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up

## ------------------------------------------------------------------------------
## Build/Run Backend Commands
## - Builds all of the biohub backend projects (db, db_setup, api)
## ------------------------------------------------------------------------------

build-backend: ## Builds all backend containers
	@echo "==============================================="
	@echo "Make: build-backend - building backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api

run-backend: ## Runs all backend containers
	@echo "==============================================="
	@echo "Make: run-backend - running backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api

run-backend-debug: ## Runs all backend containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-backend-debug - running backend images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api

## ------------------------------------------------------------------------------
## Build/Run Backend Commands
## - Builds all of the biohub backend projects (db, db_setup)
## ------------------------------------------------------------------------------

build-postgres: ## Builds the postgres db containers
	@echo "==============================================="
	@echo "Make: build-postgres - building postgres db  images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup

run-postgres: ## Runs the postgres db containers
	@echo "==============================================="
	@echo "Make: run-postgres - running postgres db  images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup

run-postgres-debug: ## Runs the postgres db containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-postgres-debug - running postgres db images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup

## ------------------------------------------------------------------------------
## Build/Run Backend+Web Commands (backend + web frontend)
## - Builds all of the biohub backend+web projects (db, db_setup, api, app, n8n, n8n_nginx)
## ------------------------------------------------------------------------------

build-web: ## Builds all backend+web containers
	@echo "==============================================="
	@echo "Make: build-web - building web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api app n8n n8n_nginx

run-web: ## Runs all backend+web containers
	@echo "==============================================="
	@echo "Make: run-web - running web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api app n8n n8n_nginx

run-web-debug: ## Runs all backend+web containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-web-debug - running web images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api app n8n n8n_nginx

## ------------------------------------------------------------------------------
## Commands to shell into the target container
## ------------------------------------------------------------------------------

database: ## Executes into database container.
	@echo "==============================================="
	@echo "Make: Shelling into database container"
	@echo "==============================================="
	@export PGPASSWORD=$(DB_ADMIN_PASS)
	@docker-compose exec db psql -U $(DB_ADMIN) -d $(DB_DATABASE)

app: ## Executes into the app container.
	@echo "==============================================="
	@echo "Shelling into app container"
	@echo "==============================================="
	@docker-compose exec app bash

api: ## Executes into the workspace container.
	@echo "==============================================="
	@echo "Shelling into api container"
	@echo "==============================================="
	@docker-compose exec api bash

n8n: ## Executes into the n8n container.
	@echo "==============================================="
	@echo "Shelling into n8n container"
	@echo "==============================================="
	@docker-compose exec n8n bash

## ------------------------------------------------------------------------------
## Database migration commands
## ------------------------------------------------------------------------------

build-db-setup: ## Build the db knex setup (migrations + seeding) image
	@echo "==============================================="
	@echo "Make: build-db-setup - building db knex setup image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db_setup

run-db-setup: ## Run the database migrations and seeding
	@echo "==============================================="
	@echo "Make: run-db-setup - running database migrations and seeding"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db_setup

build-db-migrate: ## Build the db knex migrations image
	@echo "==============================================="
	@echo "Make: build-db-migrate - bnuilding db knex migrate image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db_migrate

run-db-migrate: ## Run the database migrations
	@echo "==============================================="
	@echo "Make: run-db-migrate - running database migrations"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db_migrate

build-db-rollback: ## Build the db knex rollback image
	@echo "==============================================="
	@echo "Make: build-db-rollback - building db knex rollback image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db_rollback

run-db-rollback: ## Rollback the latest database migrations
	@echo "==============================================="
	@echo "Make: run-db-rollback - rolling back the latest database migrations"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db_rollback

## ------------------------------------------------------------------------------
## n8n commands
## ------------------------------------------------------------------------------

build-n8n-setup: ## Build the n8n setup image
	@echo "==============================================="
	@echo "Make: build-n8n-setup - building n8n setup image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build n8n_setup

run-n8n-setup: ## Run the n8n setup
	@echo "==============================================="
	@echo "Make: run-n8n-setup - running n8n setup"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up n8n_setup

## ------------------------------------------------------------------------------
## Run `npm` commands for all projects
## ------------------------------------------------------------------------------

install: ## Runs `npm install` for all projects
	@echo "==============================================="
	@echo "Running /api install"
	@echo "==============================================="
	@cd api && npm install && cd ..
	@echo "==============================================="
	@echo "Running /app install"
	@echo "==============================================="
	@cd app && npm install && cd ..
	@echo "==============================================="
	@echo "Running /database install"
	@echo "==============================================="
	@cd database && npm install && cd ..

test: ## Runs `npm test` for api, and app projects
	@echo "==============================================="
	@echo "Running /api tests"
	@echo "==============================================="
	@cd api && npm test && cd ..
	@echo "==============================================="
	@echo "Running /app tests"
	@echo "==============================================="
	@cd app && npm test && cd ..

lint: ## Runs `npm lint` for all projects
	@echo "==============================================="
	@echo "Running /api lint"
	@echo "==============================================="
	@cd api && npm run lint && cd ..
	@echo "==============================================="
	@echo "Running /app lint"
	@echo "==============================================="
	@cd app && npm run lint && cd ..
	@echo "==============================================="
	@echo "Running /database lint"
	@echo "==============================================="
	@cd database && npm run lint && cd ..

lint-fix: ## Runs `npm run lint:fix ` for all projects
	@echo "==============================================="
	@echo "Running /api lint:fix"
	@echo "==============================================="
	@cd api && npm run lint:fix && cd ..
	@echo "==============================================="
	@echo "Running /app lint:fix"
	@echo "==============================================="
	@cd app && npm run lint:fix && cd ..
	@echo "==============================================="
	@echo "Running /database lint:fix"
	@echo "==============================================="
	@cd database && npm run lint:fix && cd ..

format: ## Runs `npm run format` for all projects
	@echo "==============================================="
	@echo "Running /api format"
	@echo "==============================================="
	@cd api && npm run format && cd ..
	@echo "==============================================="
	@echo "Running /app format"
	@echo "==============================================="
	@cd app && npm run format && cd ..
	@echo "==============================================="
	@echo "Running /database format"
	@echo "==============================================="
	@cd database && npm run format && cd ..

format-fix: ## Runs `npm run format:fix` for all projects
	@echo "==============================================="
	@echo "Running /api format:fix"
	@echo "==============================================="
	@cd api && npm run format:fix && cd ..
	@echo "==============================================="
	@echo "Running /app format:fix"
	@echo "==============================================="
	@cd app && npm run format:fix && cd ..
	@echo "==============================================="
	@echo "Running /database format:fix"
	@echo "==============================================="
	@cd database && npm run format:fix && cd ..

## ------------------------------------------------------------------------------
## Run `docker logs <container> -f` commands for all projects
## ------------------------------------------------------------------------------
log-app: ## Runs `docker logs <container> -f` for the app container
	@echo "==============================================="
	@echo "Running docker logs for the app container"
	@echo "==============================================="
	@docker logs $(DOCKER_PROJECT_NAME)-app-$(DOCKER_NAMESPACE)-container -f

log-api: ## Runs `docker logs <container> -f` for the api container
	@echo "==============================================="
	@echo "Running docker logs for the api container"
	@echo "==============================================="
	@docker logs $(DOCKER_PROJECT_NAME)-api-$(DOCKER_NAMESPACE)-container -f

log-db: ## Runs `docker logs <container> -f` for the database container
	@echo "==============================================="
	@echo "Running docker logs for the db container"
	@echo "==============================================="
	@docker logs $(DOCKER_PROJECT_NAME)-db-$(DOCKER_NAMESPACE)-container -f

log-db-setup: ## Runs `docker logs <container> -f` for the database setup container
	@echo "==============================================="
	@echo "Running docker logs for the db-setup container"
	@echo "==============================================="
	@docker logs $(DOCKER_PROJECT_NAME)-db-setup-$(DOCKER_NAMESPACE)-container -f

## ------------------------------------------------------------------------------
## Help
## ------------------------------------------------------------------------------

help:	## Display this help screen.
	@grep -h -E '^[a-zA-Z_-]+:.*?##.*$$|^##.*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[33m%-20s\033[0m %s\n", $$1, $$2}' | awk 'BEGIN {FS = "## "}; {printf "\033[36m%-1s\033[0m %s\n", $$2, $$1}'
