#!/bin/bash

# How-to:
#   1. If you don't have the BCTW production database dump, run this script with the BCTW database password as an argument, while port-forwarding on port 7777.
#   2. If you already have the BCTW production database dump, run this script with the BCTW database password as an argument.
#   ./run.sh <BCTW_DB_PASSWORD>

echo "MIGRATION: Beginning SIMS -> BCTW data migration..."

if [ ! -f bctw_bctw_no_owner_no_acl_dump.sql ]; then
  export PGPASSWORD=$1
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

echo "MIGRATION: Creating SIMS database migration SQL file..."
rm -f sims-bctw-migration-final.sql
cat sims-bctw-migration_1.sql >> sims-bctw-migration-final.sql
cat bctw_bctw_no_owner_no_acl_dump.sql >> sims-bctw-migration-final.sql
cat sims-bctw-migration_2.sql >> sims-bctw-migration-final.sql
# TODO: Add this line back once working
#
# cat sims-bctw-migration_3.sql >> sims-bctw-migration-final.sql
cat sims-bctw-migration_4.sql >> sims-bctw-migration-final.sql

echo "MIGRATION: Running BCTW data migration SQL on SIMS database..."
docker cp sims-bctw-migration-final.sql sims-db-all-container:/sims-bctw-migration-final.sql &&
docker exec -it sims-db-all-container psql --single-transaction -U postgres -d biohubbc -v ON_ERROR_STOP=1 -f sims-bctw-migration-final.sql ||
echo "MIGRATION: ERROR: Failed to migrate BCTW data into SIMS database. Exiting..." &&
echo "MIGRATION: BCTW data migration into SIMS database complete."

rm -f sims-bctw-migration-final.sql

