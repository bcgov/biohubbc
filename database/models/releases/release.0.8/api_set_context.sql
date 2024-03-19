-- api_set_context.sql
drop function if exists api_set_context;

create or replace function api_set_context(_idir_user_id system_user.user_identifier%type, _bceid_user_id system_user.user_identifier%type) returns system_user.id%type
language plpgsql
security invoker
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
-- *******************************************************************
declare
  v_user_id system_user.id%type;
  v_user_identity_source_id user_identity_source.id%type;
  v_user_identifier system_user.user_identifier%type;
begin

  if (_idir_user_id is not null) THEN
    select id into strict v_user_identity_source_id from user_identity_source
      where name = 'IDIR'
      and record_end_date is null;
    
    v_user_identifier = _idir_user_id; 
  elsif (_bceid_user_id is not null) THEN
    select id into strict v_user_identity_source_id from user_identity_source
      where name = 'BCEID'
      and record_end_date is null;

    v_user_identifier = _bceid_user_id; 
  end if;

  select id into strict v_user_id from system_user
    where uis_id = v_user_identity_source_id
    and user_identifier = v_user_identifier;

  create temp table if not exists biohub_context_temp (tag varchar(200), value varchar(200));
  delete from biohub_context_temp where tag = 'user_id';
  insert into biohub_context_temp (tag, value) values ('user_id', v_user_id::varchar(200));

  return v_user_id;  
exception
  when others THEN
    raise;
end;
$$;

