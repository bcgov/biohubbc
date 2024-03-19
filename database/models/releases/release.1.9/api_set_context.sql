-- api_set_context.sql
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
