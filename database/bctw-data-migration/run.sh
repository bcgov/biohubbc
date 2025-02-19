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
#
# Port-forwarding: 7777 -> BCTW production database, 8888 -> SIMS production database
#
############################################################################################################

echo "MIGRATION: Beginning SIMS -> BCTW data migration..."

if [ ! -f bctw_bctw_no_owner_no_acl_dump.sql ]; then
  # Manually port-forward to BCTW production database port: 7777
  echo "MIGRATION: Dumping data from BCTW production database..."

  pg_dump -h localhost -p 7777 -U bctw -d bctw --schema=bctw --verbose \
  --exclude-table=telemetry_api_lotek --exclude-table=telemetry_api_vectronic \
  --exclude-table=telemetry --exclude-table=telemetry_with_security_m \
  --exclude-table=latest_transmissions --exclude-table=historical_telemetry_with_security_m \
  --exclude-table=latest_valid_transmissions --exclude-table=security_reasons --exclude-table=security_rules \
  --exclude-table=species --exclude-table=onboarding --exclude-table=permission_request \
  --exclude-table=file --exclude-table=cols --exclude-table=telemetry_sensor_alert \
  --exclude-table="animal_*_v" --exclude-table="historical_*_v" --exclude-table="telemetry_*_v" \
  --exclude-table=unassigned_telemetry_v --exclude-table=user_alert_v \
  --no-owner --no-acl --file=bctw_bctw_no_owner_no_acl_dump.sql

  # Fix the schema creation lines
  sed -i 's/^CREATE SCHEMA bctw;/CREATE SCHEMA IF NOT EXISTS bctw;/' bctw_bctw_no_owner_no_acl_dump.sql
  sed -i 's/^CREATE SCHEMA bctw_dapi_v1;/CREATE SCHEMA IF NOT EXISTS bctw_dapi_v1;/' bctw_bctw_no_owner_no_acl_dump.sql
  sed -i 's/^CREATE SCHEMA crypto;/CREATE SCHEMA IF NOT EXISTS crypto;/' bctw_bctw_no_owner_no_acl_dump.sql

else
  echo "MIGRATION: Using existing BCTW production database dump..."
fi

# Check if the BCTW production database dump exists
if [ ! -f bctw_bctw_no_owner_no_acl_dump.sql ]; then
  echo "MIGRATION: ERROR: BCTW production database dump not found. Exiting..."
  exit 1
fi

echo "MIGRATION: Creating BCTW -> SIMS database migration file..."
# Remove the existing migration file
rm -f sims-bctw-migration-final.sql

# Concatenate the migration files into one large file
# Append the first migration file to the migration file (this file contains the schema creation)
cat sims-bctw-migration_1.sql >> sims-bctw-migration-final.sql
# Append the BCTW production database dump to the migration file
cat bctw_bctw_no_owner_no_acl_dump.sql >> sims-bctw-migration-final.sql
# Append the remaining migration files to the migration file
cat sims-bctw-migration_2.sql >> sims-bctw-migration-final.sql
cat sims-bctw-migration_3.sql >> sims-bctw-migration-final.sql
cat sims-bctw-migration_4.sql >> sims-bctw-migration-final.sql


# Check if production flag is used.
if [ "$3" = "--prod" ]; then
  echo "MIGRATION: Running BCTW data migration SQL on PRODUCTION SIMS database..."

  # Run the migration file on the production database (port-forwarded to 8888)
  psql --single-transaction -h localhost -p 8888 -U postgres -d biohubbc -v ON_ERROR_STOP=1 -f sims-bctw-migration-final.sql &&

  echo "MIGRATION: BCTW data migration into SIMS PRODUCTION database complete." ||
  echo "MIGRATION: ERROR: Failed to migrate BCTW data into SIMS PRODUCTION database. Exiting..."
else
  echo "MIGRATION: Running BCTW data migration SQL on LOCAL SIMS database..."

  # Copy the migration file into the docker container
  docker cp sims-bctw-migration-final.sql sims-db-all-container:/sims-bctw-migration-final.sql &&
  # Run the migration file on the local database (inside the docker container)
  docker exec -it sims-db-all-container psql --single-transaction -U postgres -d biohubbc -v ON_ERROR_STOP=1 -f sims-bctw-migration-final.sql &&

  echo "MIGRATION: BCTW data migration into SIMS LOCAL database complete." ||
  echo "MIGRATION: ERROR: Failed to migrate BCTW data into SIMS LOCAL database. Exiting..."
fi


rm -f sims-bctw-migration-final.sql

