#!make

# ------------------------------------------------------------------------------
# Makefile -- BioHubBC api
# ------------------------------------------------------------------------------

# You must manually create an empty `.env` file at the root level (this level), otherwise the below commands will fail.
-include .env

export $(shell sed 's/=.*//' .env)

all : help
.DEFAULT : help
.PHONY : local local-debug build-local setup-local run-local run-debug close-local cclean-local test-local api help

# ------------------------------------------------------------------------------
# Task Aliases
# ------------------------------------------------------------------------------

# Running the docker build
# 1. Run `make env`
# 2. Edit the `.env` file as needed to update variables and  secrets
# 3. Run `make local` or `make local-debug`

env: | setup-docker ## Copies the default ./env_config/env.docker to ./.env

local: | close-local build-local run-local ## Performs all commands necessary to run api in docker

local-debug: | close-local build-local run-debug ## Performs all commands necessary to run api in docker in debug mode

# ------------------------------------------------------------------------------
# Development Commands
# ------------------------------------------------------------------------------

setup-docker: ## Prepares the environment variables used by the api docker containers
	@echo "==============================================="
	@echo "Make: setup-local - copying env.docker to .env"
	@echo "==============================================="
	@cp -i env_config/env.docker .env

build-local: ## Builds the api containers
	@echo "==============================================="
	@echo "Make: build-local - building api Docker image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build

run-local: ## Runs the api containers
	@echo "==============================================="
	@echo "Make: run-local - running api"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d

run-debug: ## Runs the api containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-debug - running api for debugging"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up

close-local: ## Closes the api containers
	@echo "==============================================="
	@echo "Make: close-local - closing api containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down

clean-local: ## Closes and cleans (removes) api containers
	@echo "==============================================="
	@echo "Make: clean-local - closing and cleaning api containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans

# ------------------------------------------------------------------------------
# Helper Commands
# ------------------------------------------------------------------------------

api: ## Shells into the api container
	@echo "==============================================="
	@echo "Shelling into api container"
	@echo "==============================================="
	@docker-compose exec api bash

help:	## Display this help screen.
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
