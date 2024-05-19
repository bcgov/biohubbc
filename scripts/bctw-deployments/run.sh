#!/bin/bash

# Author: Mac Deluca
# Date: April 23, 2024
# Description: Helper script generate and run SQL on docker db container.
# How-to: ./run.sh input-filename.json


# Check if the script is called with at least one argument.
if [ $# -eq 0 ]; then
    echo "Execute on local DB: ./run.sh files/input.dev.json"
    echo "Execute on production DB: ./run.sh files/<input-filename>.json --prod"
    exit 1
fi

# Check if production flag is used.
if [ "$2" = "--prod" ]; then
  # Note: must be port-forwarding to a production database
  ./main.js "$1" > files/deployments.sql && \
  psql -h localhost -p 9999 -U postgres -d biohubbc < files/deployments.sql
else
  ./main.js "$1" > files/deployments.sql && \
  docker exec -i sims-db-all-container psql -U postgres -d biohubbc < files/deployments.sql
fi

exit 0

