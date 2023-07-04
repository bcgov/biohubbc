-- api_get_context_system_user_role_id.sql

CREATE OR REPLACE FUNCTION api_get_context_system_user_role_id()
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    stable
AS $$
-- *******************************************************************
-- Procedure: api_get_context_system_user_role_id
-- Purpose: returns the context system user role id from the invokers
-- temp table
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- roland.stens@gov.bc.ca
--                  2021-06-03  initial release
-- *******************************************************************
declare
  _system_role_id system_user_role.system_role_id%type;
begin
  select value::integer into _system_role_id from biohub_context_temp where tag = 'system_user_role_id';

  return _system_role_id;
end;
$$;
