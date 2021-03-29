-- db_setup_up.sql
-- TODO: lock down public but allow access to postgis installed there
--REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;

-- set up spatial extensions
\i create_spatial_extensions.psql

-- set up project management schema
create schema if not exists biohub;
set search_path = biohub, public;
\i biohub.sql
\i populate_user_identity_source.sql
\i api_set_context.sql
\i tr_audit_trigger.sql
\i project_audit_triggers.sql
\i api_get_context_user_id.sql
\i tr_journal_trigger.sql
\i project_journal_triggers.sql
\i tr_project_funding_source.sql

-- populate look up tables
set search_path = biohub;
\i populate_first_nations.sql
\i populate_climate_change_initiatives.sql
\i populate_management_action_type.sql
\i populate_funding_source.sql
\i populate_investment_action_category.sql
\i populate_project_type.sql
\i populate_activity.sql
\i populate_icun_classifications.sql

-- postgis reader role
--create role postgis_reader inherit;
--grant select on public.geometry_columns to postgis_reader;
--grant select on public.geography_columns to postgis_reader;
--grant select on public.spatial_ref_sys to postgis_reader;

-- setup biohub api schema
create schema if not exists biohub_dapi_v1;
set search_path = biohub_dapi_v1;
\i project_dapi_views.sql

-- setup api user
create user biohub_api password 'flatpass';
grant usage on schema biohub_dapi_v1 to biohub_api;
grant usage on schema biohub to biohub_api;
grant all on all tables in schema biohub_dapi_v1 to biohub_api;
alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;
--grant postgis_reader to biohub_api;
alter role biohub_api set search_path to biohub_dapi_v1, biohub, public, topology;

set search_path = biohub;
grant execute on function api_set_context(idir_user_id system_user.user_identifier%type, bceid_user_id system_user.user_identifier%type) to biohub_api;
