-- db_setup_up.sql
set search_path = biohub;
\i biohub.0.5.sql
\i biohub_audit_triggers.sql
\i biohub_journal_triggers.sql

-- set search_path = biohub_dapi_views;
\i biohub_dapi_views.sql
