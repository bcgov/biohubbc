-- db_setup_up.sql
\set ON_ERROR_STOP on
-- drop the database
set role postgres;
\c postgres
drop database biohub;
drop role biohub_api;
create database biohub;
\c biohub

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
\i tr_survey_proprietor.sql
\i tr_project.sql
\i tr_survey.sql
\i tr_permit.sql

\i api_delete_project.sql

-- populate look up tables
set search_path = biohub;
set client_min_messages=warning;
\set QUIET on
\i populate_first_nations.sql
\i populate_climate_change_initiatives.sql
\i populate_management_action_type.sql
\i populate_funding_source.sql
\i populate_investment_action_category.sql
\i populate_project_type.sql
\i populate_activity.sql
\i populate_iucn_classifications.sql
\i populate_project_role.sql
\i populate_system_role.sql
\i populate_administrative_activity_type.sql
\i populate_administrative_activity_status_type.sql
\i populate_proprietor_type.sql
\i populate_wldtaxonomic_units.sql
set client_min_messages=notice;
\set QUIET off

-- postgis reader role
--create role postgis_reader inherit;
--grant select on public.geometry_columns to postgis_reader;
--grant select on public.geography_columns to postgis_reader;
--grant select on public.spatial_ref_sys to postgis_reader;

-- setup biohub api schema
create schema if not exists biohub_dapi_v1;

-- setup api user
create user biohub_api password 'flatpass';
alter schema biohub_dapi_v1 owner to biohub_api;
grant usage on schema biohub_dapi_v1 to biohub_api;
grant usage on schema biohub to biohub_api;
grant all on all tables in schema biohub_dapi_v1 to biohub_api;
alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;
--grant postgis_reader to biohub_api;
alter role biohub_api set search_path to biohub_dapi_v1, biohub, public, topology;

set search_path = biohub_dapi_v1;
set role biohub_api;
\i  ${project_dapi_views};
set role postgres;

set search_path = biohub;
grant execute on function biohub.api_set_context(_system_user_identifier system_user.user_identifier%type, _user_identity_source_name user_identity_source.name%type) to biohub_api;
