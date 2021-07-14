-- api_get_context_user_id.sql
create or replace function api_get_context_user_id() returns system_user.system_user_id%type
language plpgsql
security invoker
stable
as 
$$
-- *******************************************************************
-- Procedure: api_get_context_user_id
-- Purpose: returns the context user id from the invokers temp table
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
declare
  _system_user_id system_user.system_user_id%type;
begin
  select value::integer into _system_user_id from biohub_context_temp where tag = 'user_id';
  
  return _system_user_id;
end;
$$;