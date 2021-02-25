-- db_setup_up.sql
set search_path = biohub;
\i biohub.0.6.sql
\i biohub_audit_triggers.sql
\i biohub_journal_triggers.sql
\i populate_first_nations.sql
\i populate_funding_source.sql
\i populate_investment_action_category.sql

set search_path = biohub_dapi_views;
\i biohub_dapi_views.sql
