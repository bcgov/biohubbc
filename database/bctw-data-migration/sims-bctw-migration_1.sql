-- Create initial BCTW schema
CREATE SCHEMA IF NOT EXISTS bctw;

-- Grant postgres user full access to bctw schema (needed?)
GRANT ALL ON SCHEMA bctw TO postgres;

-- Create crypto schema, which is required by the BCTW export file.
CREATE SCHEMA IF NOT EXISTS crypto;
CREATE FUNCTION crypto.gen_random_uuid() RETURNS uuid
LANGUAGE sql
AS $$
  SELECT public.gen_random_uuid();
$$;

-- Export bctw to file:
--   Run in terminal in Openshift pod:
--     pg_dump -U postgres -d bctw --schema=bctw --exclude-table=telemetry_api_vectronic --exclude-table=telemetry_api_lotek --no-owner --no-acl --file=bctw_bctw_no_owner_no_acl_dump.sq

-- Import bctw from file:
--   Run in terminal:
--     psql -U postgres -d biohubbc -f bctw_bctw_no_owner_no_acl_dump.sql

