#!make

# ------------------------------------------------------------------------------
# Makefile -- BioHubBC
# ------------------------------------------------------------------------------

# You must manually create an empty `.env` file at the root level (this level), otherwise the below commands will fail.
-include .env

export $(shell sed 's/=.*//' .env)

all : help
.DEFAULT : help
.PHONY : setup close clean build run run-debug build-backend run-backend run-backend-debug database app app-ionic api help

# ------------------------------------------------------------------------------
# Task Aliases
# ------------------------------------------------------------------------------

# Running the docker build
# 1. Run `make env`
# 2. Edit the `.env` file as needed to update variables and  secrets
# 3. Run `make local` or `make local-debug`

env: | setup ## Copies the default ./env_config/env.docker to ./.env

all: | close build run ## Performs all commands necessary to run all projects in docker

all-debug: | close build run-debug ## Performs all commands necessary to run all projects in docker in debug mode

backend: | close build-backend run-backend ## Performs all commands necessary to run all abckend projects in docker

backend-debug: | close build-backend run-backend-debug ## Performs all commands necessary to run all abckend projects in docker in debug mode

# ------------------------------------------------------------------------------
# Setup/Cleanup Commands
# ------------------------------------------------------------------------------

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

# ------------------------------------------------------------------------------
# Build/Run Backend+Frontend Commands
# - Builds all of the biohub projects (database, api, app, app-ionic)
# ------------------------------------------------------------------------------

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


# ------------------------------------------------------------------------------
# Build/Run Backend Commands
# - Builds all of the biohub backend projects (database, api)
# ------------------------------------------------------------------------------

build-backend: ## Builds all project containers
	@echo "==============================================="
	@echo "Make: build-backend - building backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api nginx

run-backend: ## Runs all project containers
	@echo "==============================================="
	@echo "Make: run-backend - running backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api nginx

run-backend-debug: ## Runs all project containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-backend-debug - running backend images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api nginx

# ------------------------------------------------------------------------------
# Exec Commands
# - Autmatically execs into the specified container
# ------------------------------------------------------------------------------

database: ## Executes into database container.
	@echo "==============================================="
	@echo "Make: Shelling into database container"
	@echo "==============================================="
	@export PGPASSWORD=$(DB_PASS)
	@docker-compose exec db psql -U $(DB_USER) $(DB_DATABASE)

app: ## Executes into the app container.
	@echo "==============================================="
	@echo "Shelling into app container"
	@echo "==============================================="
	@docker-compose exec app bash

app-ionic: ## Executes into the app container.
	@echo "==============================================="
	@echo "Shelling into app-ionic container"
	@echo "==============================================="
	@docker-compose exec app_ionic bash

api: ## Executes into the workspace container.
	@echo "==============================================="
	@echo "Shelling into api container"
	@echo "==============================================="
	@docker-compose exec api bash

# ------------------------------------------------------------------------------
# Help Commands
# ------------------------------------------------------------------------------

help:	## Display this help screen.
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
