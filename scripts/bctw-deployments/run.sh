#!/bin/bash

# Author: Mac Deluca
# Date: April 23, 2024
# Description: Helper script generate and run SQL on docker db container.
# How-to: ./run.sh input-filename.json
# Todo: Accept arguments that apply SQL to prod.

./main.js $1 > files/deployments.sql && \
docker exec -i sims-db-all-container psql -U postgres -d biohubbc < files/deployments.sql
