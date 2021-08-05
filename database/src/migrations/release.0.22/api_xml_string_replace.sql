-- api_xml_string_replace.sql
create or replace function api_xml_string_replace(p_string varchar) returns varchar
language plpgsql
security invoker
stable
as 
$$
-- *******************************************************************
-- Procedure: api_xml_string_replace
-- Purpose: returns an string with replacments for <,> and &
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
begin
  
  return replace(replace(replace(p_string, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
end;
$$;