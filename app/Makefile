#!make

# ------------------------------------------------------------------------------
# Makefile -- BioHubBC app
# ------------------------------------------------------------------------------

-include .env

export $(shell sed 's/=.*//' .env)

all : help
.DEFAULT : help
.PHONY : local local-debug build-local setup-local run-local run-debug close-local cclean-local test-local database app help

# ------------------------------------------------------------------------------
# Task Aliases
# ------------------------------------------------------------------------------

# Note: If you need to edit the .env file before running the build:
# 1. Run `make setup-docker`
# 2. Edit the `.env` file
# 3. Run `make local` or `make local-debug`

local: | setup-docker close-local build-local run-local ## Performs all commands necessary to run app in docker

local-debug: | setup-docker close-local build-local run-debug ## Performs all commands necessary to run app in docker in debug mode

# ------------------------------------------------------------------------------
# Development Commands
# ------------------------------------------------------------------------------

setup-local: ## Prepares the environment variables for local development (will not overwrite an existing .env file)
	@echo "==============================================="
	@echo "Make: setup-local - copying env.local to .env"
	@echo "==============================================="
	@cp -i env_config/env.local .env

setup-docker: ## Prepares the environment variables for local development using docker (will not overwrite an existing .env file)
	@echo "==============================================="
	@echo "Make: setup-local - copying env.docker to .env"
	@echo "==============================================="
	@cp -i env_config/env.docker .env

build-local: ## Builds the local development containers
	@echo "==============================================="
	@echo "Make: build-local - building app Docker image"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build

run-local: ## Runs the local development containers
	@echo "==============================================="
	@echo "Make: run-local - running app"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d

run-debug: ## Runs the local development containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-debug - running app for debugging"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up

close-local: ## Closes the local development containers
	@echo "==============================================="
	@echo "Make: close-local - closing local app containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down

clean-local: ## Closes and cleans (removes) local development containers
	@echo "==============================================="
	@echo "Make: clean-local - closing and cleaning app containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans

# ------------------------------------------------------------------------------
# Helper Commands
# ------------------------------------------------------------------------------

app: ## Executes into the workspace container.
	@echo "==============================================="
	@echo "Shelling into app container"
	@echo "==============================================="
	@docker-compose exec app bash

help:	## Display this help screen.
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
