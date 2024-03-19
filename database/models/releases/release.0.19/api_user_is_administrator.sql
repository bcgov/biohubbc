-- api_user_is_administrator.sql
drop function if exists api_user_is_administrator;

create or replace function api_user_is_administrator(__system_user_id system_user.id%type default null) returns boolean
language plpgsql
security definer
as 
$$
-- *******************************************************************
-- Procedure: api_user_is_administrator
-- Purpose: returns true if user is a system administrator and false otherwise
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-06-21  initial release
-- *******************************************************************
declare
  __id system_user.id%type;
begin
  if (__system_user_id is null) then
    select api_get_context_user_id() into __id;
  else
    __id = __system_user_id;
  end if;

  return (select exists (select 1 from system_user_role sur, system_role sr
    where sur.su_id = __id
    and sur.sr_id = sr.id
    and sr.name = (select api_get_character_system_constant('SYSTEM_ROLES_SYSTEM_ADMINISTRATOR'))
    and sr.record_end_date is null));

exception
  when others THEN
    raise;    
end;
$$;
