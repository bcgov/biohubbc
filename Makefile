#!make

# ------------------------------------------------------------------------------
# Makefile -- BioHubBC
# ------------------------------------------------------------------------------

-include .env

# Apply the contents of the .env to the terminal, so that the docker-compose file can use them in its builds
export $(shell sed 's/=.*//' .env)

.DEFAULT : help
.PHONY : setup close clean build run run-debug build-backend run-backend run-backend-debug build-web run-web run-web-debug build-ionic run-ionic run-ionic-debug database app app-ionic api help

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

backend: | close build-backend run-backend ## Performs all commands necessary to run all backend projects in docker
backend-debug: | close build-backend run-backend-debug ## Performs all commands necessary to run all backend projects in docker in debug mode

web: | close build-web run-web ## Performs all commands necessary to run all backend+web projects in docker
web-debug: | close build-web run-web-debug ## Performs all commands necessary to run all backend+web projects in docker in debug mode

ionic: | close build-ionic run-ionic ## Performs all commands necessary to run all backend+ionic projects in docker
ionic-debug: | close build-ionic run-ionic-debug ## Performs all commands necessary to run all backend+ionic projects in docker in debug mode

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
# - Builds all of the biohub projects (db, db_setup, api, nginx, app, app_ionic)
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
# - Builds all of the biohub backend projects (db, db_setup, api, nginx)
# ------------------------------------------------------------------------------

build-backend: ## Builds all backend containers
	@echo "==============================================="
	@echo "Make: build-backend - building backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api nginx

run-backend: ## Runs all backend containers
	@echo "==============================================="
	@echo "Make: run-backend - running backend images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api nginx

run-backend-debug: ## Runs all backend containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-backend-debug - running backend images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api nginx

# ------------------------------------------------------------------------------
# Build/Run Backend+Web Commands (backend + web frontend)
# - Builds all of the biohub backend+web projects (db, db_setup, api, nginx, app)
# ------------------------------------------------------------------------------

build-web: ## Builds all backend+web containers
	@echo "==============================================="
	@echo "Make: build-web - building web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api nginx app

run-web: ## Runs all backend+web containers
	@echo "==============================================="
	@echo "Make: run-web - running web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api nginx app

run-web-debug: ## Runs all backend+web containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-web-debug - running web images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api nginx app

# ------------------------------------------------------------------------------
# Build/Run Backend+Ionic Commands (backend + ionic frontend)
# - Builds all of the biohub backend+ionic projects (db, db_setup, api, nginx, app_ionic)
# ------------------------------------------------------------------------------

build-ionic: ## Builds all backend+web containers
	@echo "==============================================="
	@echo "Make: build-ionic - building ionic images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build db db_setup api nginx app_ionic

run-ionic: ## Runs all backend+web containers
	@echo "==============================================="
	@echo "Make: run-ionic - running ionic images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d db db_setup api nginx app_ionic

run-ionic-debug: ## Runs all backend+web containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-ionic-debug - running ionic images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up db db_setup api nginx app_ionic

# ------------------------------------------------------------------------------
# Exec Commands
# - Autmatically execs into the specified container
# ------------------------------------------------------------------------------

database: ## Executes into database container.
	@echo "==============================================="
	@echo "Make: Shelling into database container"
	@echo "==============================================="
	@export PGPASSWORD=$(DB_USER_PASS)
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
