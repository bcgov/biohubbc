-- api_set_context.sql
drop function if exists api_set_context;

create or replace function api_set_context(_idir_user_id system_user.external_id%type, _bceid_user_id system_user.external_id%type) returns system_user.id%type
language plpgsql
security definer
as
$$
declare
  v_user_id system_user.id%type;
  v_user_identity_source_id user_identity_source.id%type;
  v_external_id system_user.external_id%type;
begin

  if (_idir_user_id is not null) THEN
    select id into strict v_user_identity_source_id from user_identity_source
      where name = 'IDIR'
      and record_end_date is null;
    
    v_external_id = _idir_user_id; 
  elsif (_bceid_user_id is not null) THEN
    select id into strict v_user_identity_source_id from user_identity_source
      where name = 'BCEID'
      and record_end_date is null;

    v_external_id = _bceid_user_id; 
  end if;

  select id into strict v_user_id from system_user
    where uis_id = v_user_identity_source_id
    and external_id = v_external_id;

  perform set_config(user||'.user_id', v_user_id::character, false);

  return v_user_id;  
exception
  when others THEN
    raise;
end;
$$;

grant execute on function api_set_context(idir_user_id system_user.external_id%type, bceid_user_id system_user.external_id%type) to biohub_api;