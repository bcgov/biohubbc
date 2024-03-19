-- db_setup_down.sql
drop owned by biohub_api;
drop user if exists biohub_api;

drop schema if exists biohub_dapi_v1 cascade;
drop schema if exists biohub cascade;
