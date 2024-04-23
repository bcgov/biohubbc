#!/bin/bash

# Script Name: run.sh
# Description: This script runs generated SQL on running db container.
# Author: Mac Deluca
# Date: April 23, 2024

./main.js files/input.json > files/deployments.sql && \
docker exec -i sims-db-all-container psql -U postgres -d biohubbc < files/deployments.sql
