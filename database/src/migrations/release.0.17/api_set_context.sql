-- api_set_context.sql

-- FUNCTION: biohub.api_set_context(character varying, character varying)
CREATE OR REPLACE FUNCTION biohub.api_set_context(
	_system_user_identifier character varying,
	_user_identity_source_name character varying)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    SET client_min_messages='warning'
AS $$
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
  v_user_id biohub.system_user.id%type;
  v_user_identity_source_id biohub.user_identity_source.id%type;
  v_system_role_id biohub.system_user_role.sr_id%type;
begin

  select id into strict v_user_identity_source_id from user_identity_source
    where name = _user_identity_source_name
    and record_end_date is null;

  select id into strict v_user_id from system_user
    where uis_id = v_user_identity_source_id
    and user_identifier = _system_user_identifier;

  if v_user_identity_source_id = 1::integer then
  	v_system_role_id = NULL;
  else
	select sr_id into strict v_system_role_id from system_user_role where su_id = v_user_id;
  end if;

  create temp table if not exists biohub_context_temp (tag varchar(200), value varchar(200));
  delete from biohub_context_temp;
  insert into biohub_context_temp (tag, value) values ('user_id', v_user_id::varchar(200));
  insert into biohub_context_temp (tag, value) values ('system_user_role_id', v_system_role_id::varchar(200));

  return v_user_id;
exception
  when others THEN
    raise;
end;
$$;
