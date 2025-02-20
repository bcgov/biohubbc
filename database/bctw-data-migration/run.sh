#!/bin/bash

############################################################################################################
#
# Date: Febuary 19, 2025
#
# Description: Script to migrate the production data from the BCTW production database
# into the SIMS production database. Will include the final-working dump file in Confulence / Jira.
#
# Notes: The dump file will only be created if it does not already exist. Deleting the dump file
# will force the script to create a new one. The final migration `sims-bctw-migration-final.sql`
# file will be created and deleted every time the script is run.
#
# How-to: ./run.sh [--prod] # Providing the --prod flag will run the migration on the production database
# Note: Must be port-forwarding to the SIMS production database.
#
# Port-forwarding: 7777 -> BCTW production database, 8888 -> SIMS production database
#
############################################################################################################


BCTW_DUMP_FILE="bctw_bctw_no_owner_no_acl_dump.sql"
MIGRATION_FILE="sims-bctw-migration-final.sql"
BCTW_DB_PORT=7777
SIMS_DB_PORT=9999
SIMS_DOCKER_CONTAINER="sims-db-all-container"

echo "MIGRATION: Beginning SIMS -> BCTW data migration..."

# Step 1: Check if the database dump already exists
if [ ! -f "$BCTW_DUMP_FILE" ]; then
  echo "MIGRATION: Dumping data from BCTW production database..."
  echo "Ensure you have manually port-forwarded to BCTW production database on port: $BCTW_DB_PORT"

  pg_dump -h localhost -p "$BCTW_DB_PORT" -U bctw -d bctw --schema=bctw --verbose \
    --exclude-table=telemetry_api_lotek \
    --exclude-table=telemetry_api_vectronic \
    --exclude-table=telemetry \
    --exclude-table=telemetry_with_security_m \
    --exclude-table=latest_transmissions \
    --exclude-table=historical_telemetry_with_security_m \
    --exclude-table=latest_valid_transmissions \
    --exclude-table=security_reasons \
    --exclude-table=security_rules \
    --exclude-table=species \
    --exclude-table=onboarding \
    --exclude-table=permission_request \
    --exclude-table=file \
    --exclude-table=cols \
    --exclude-table=telemetry_sensor_alert \
    --exclude-table="animal_*_v" \
    --exclude-table="historical_*_v" \
    --exclude-table="telemetry_*_v" \
    --exclude-table=unassigned_telemetry_v \
    --exclude-table=user_alert_v \
    --no-owner --no-acl --file="$BCTW_DUMP_FILE"

  # Ensure schemas exist instead of creating new ones unnecessarily
  sed -i 's/^CREATE SCHEMA bctw;/CREATE SCHEMA IF NOT EXISTS bctw;/' "$BCTW_DUMP_FILE"
  sed -i 's/^CREATE SCHEMA bctw_dapi_v1;/CREATE SCHEMA IF NOT EXISTS bctw_dapi_v1;/' "$BCTW_DUMP_FILE"
  sed -i 's/^CREATE SCHEMA crypto;/CREATE SCHEMA IF NOT EXISTS crypto;/' "$BCTW_DUMP_FILE"
else
  echo "MIGRATION: Using existing BCTW production database dump..."
fi

# Step 2: Ensure the dump file exists before proceeding
if [ ! -f "$BCTW_DUMP_FILE" ]; then
  echo "MIGRATION: ERROR: BCTW production database dump not found. Exiting..."
  exit 1
fi

echo "MIGRATION: Creating BCTW -> SIMS database migration file..."

# Remove any existing migration file
rm -f "$MIGRATION_FILE"

# Step 3: Concatenate migration files into a single script
cat sims-bctw-etl_0.sql >> "$MIGRATION_FILE"
cat "$BCTW_DUMP_FILE" >> "$MIGRATION_FILE"
cat sims-bctw-etl_1b.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_1c.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_2a.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_2b.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_2c.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_2d.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_3a.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_3b.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_3c.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_3d.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_4a.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_5a.sql >> "$MIGRATION_FILE"
cat sims-bctw-etl_6a.sql >> "$MIGRATION_FILE"

# Step 4: Run migration on the appropriate database
if [ "$1" = "--prod" ]; then
  echo "MIGRATION: Running BCTW data migration SQL on PRODUCTION SIMS database..."

  if psql --single-transaction -h localhost -p "$SIMS_DB_PORT" -U postgres -d biohubbc -v ON_ERROR_STOP=1 -f "$MIGRATION_FILE"; then
    echo "MIGRATION: BCTW data migration into SIMS PRODUCTION database complete."
  else
    echo "MIGRATION: ERROR: Failed to migrate BCTW data into SIMS PRODUCTION database. Exiting..."
  fi

else
  echo "MIGRATION: Running BCTW data migration SQL on LOCAL SIMS database..."

  # Copy the migration file into the Docker container
  docker cp "$MIGRATION_FILE" "$SIMS_DOCKER_CONTAINER:/sims-bctw-migration-final.sql"

  # Execute the migration inside the container
  if docker exec -it "$SIMS_DOCKER_CONTAINER" psql --single-transaction -U postgres -d biohubbc -v ON_ERROR_STOP=1 -f sims-bctw-migration-final.sql; then
    echo "MIGRATION: BCTW data migration into SIMS LOCAL database complete."
  else
    echo "MIGRATION: ERROR: Failed to migrate BCTW data into SIMS LOCAL database. Exiting..."
  fi

fi

# Cleanup: Remove the migration file after execution
rm -f "$MIGRATION_FILE"

