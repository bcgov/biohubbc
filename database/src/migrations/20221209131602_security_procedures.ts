import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

drop function if exists api_set_context;

create or replace function api_set_context(p_system_user_identifier system_user.user_identifier%type, p_user_identity_source_name user_identity_source.name%type) returns system_user.system_user_id%type
language plpgsql
security invoker
set client_min_messages = warning
as
$$
-- *******************************************************************
-- Procedure: api_set_context
-- Purpose: sets the initial context for api users
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
--                  2021-04-16  adjusted to accepted defined user identity source
-- roland.stens@gov.bc.ca
--                  2021-07-15  Added security related updates and additions
-- charlie.garrettjones@quartech.com
--                  2022-12-20  removed security concepts
-- *******************************************************************
declare
  _system_user_id system_user.system_user_id%type;
  _user_identity_source_id user_identity_source.user_identity_source_id%type;
begin

  select user_identity_source_id into strict _user_identity_source_id from user_identity_source
    where name = p_user_identity_source_name
    and record_end_date is null;

  select system_user_id into strict _system_user_id from system_user
    where user_identity_source_id = _user_identity_source_id
    and user_identifier = p_system_user_identifier;

  create temp table if not exists biohub_context_temp (tag varchar(200), value varchar(200));
  delete from biohub_context_temp where tag = 'user_id';
  insert into biohub_context_temp (tag, value) values ('user_id', _system_user_id::varchar(200));

  return _system_user_id;
exception
  when others THEN
    raise;
end;
$$;

drop function if exists api_security_check;
drop function if exists api_apply_security_rule;
drop function if exists api_secure_record;
drop function if exists api_get_context_system_user_role_id;
drop function if exists api_security_maintenance;
drop function if exists api_security_rules_bulk_apply;
drop function if exists api_secure_attachment_record;
drop function if exists api_unsecure_attachment_record;

drop trigger if exists secure_record on project_attachment;
drop trigger if exists secure_record on project_report_attachment;
drop trigger if exists secure_record on survey_attachment;
drop trigger if exists secure_record on survey_report_attachment;
drop trigger if exists occurrence_submission_val on biohub.occurrence_submission;

drop function if exists tr_secure_record_trigger;
drop function if exists tr_occurrence_submission;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  `);
}
