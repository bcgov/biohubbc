-- api_get_system_metadata_constant.sql
drop function if exists api_get_character_system_metadata_constant;

create or replace function api_get_character_system_metadata_constant(_constant_name system_metadata_constant.constant_name%type) returns system_metadata_constant.character_value%type
language plpgsql
security definer
stable
as 
$$
-- *******************************************************************
-- Procedure: api_get_character_system_metadata_constant
-- Purpose: returns a text value from the system constants table
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-06-29  initial release
-- *******************************************************************
begin
  return (select character_value from system_metadata_constant where constant_name = _constant_name);

exception
  when others then
    raise;
end;
$$;

grant execute on function api_get_character_system_metadata_constant to biohub_api;

drop function if exists api_get_numeric_system_metadata_constant;

create or replace function api_get_numeric_system_metadata_constant(_constant_name system_metadata_constant.constant_name%type) returns system_metadata_constant.numeric_value%type
language plpgsql
security definer
stable
as 
$$
-- *******************************************************************
-- Procedure: api_get_numeric_system_metadata_constant
-- Purpose: returns a numeric value from the system constants table
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-06-29  initial release
-- *******************************************************************
begin
  return (select numeric_value from system_metadata_constant where constant_name = _constant_name);

exception
  when others then
    raise;
end;
$$;

grant execute on function api_get_numeric_system_metadata_constant to biohub_api;
