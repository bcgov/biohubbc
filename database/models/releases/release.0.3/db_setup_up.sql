-- db_setup_up.sql
REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;

create schema if not exists biohub;
set search_path = biohub;
\i biohub.0.3.sql
\i biohub_admin.0.3.sql
\i populate_user_identity_source.sql

create schema if not exists biohub_dapi_v1;

create user biohub_api password 'flatpass';

alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;
\i biohub_dapi_views.sql
\i api_set_context.sql
\i tr_audit_trigger.sql
\i biohub_audit_triggers.sql
\i api_get_context_user_id.sql
\i tr_journal_trigger.sql
\i biohub_journal_triggers.sql

grant usage on schema biohub_dapi_v1 to biohub_api;
grant usage on schema biohub to biohub_api;
grant all on all tables in schema biohub_dapi_v1 to biohub_api;
alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to biohub_api;

alter role biohub_api set search_path to biohub_dapi_v1, biohub;

-- populate look up tables
\i populate_climate_change_initiatives.sql
\i populate_management_action_type.sql
\i populate_land_based_investment_strategy.sql
\i populate_funding_agency.sql