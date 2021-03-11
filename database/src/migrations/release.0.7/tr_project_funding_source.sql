-- tr_project_funding_source.sql
create or replace function tr_project_funding_source() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_project_funding_source
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
declare
  __project_id_optional funding_source.project_id_optional%type;
begin
  -- query funding source to determine optionality of funding source project id
  if new.funding_source_project_id is null then    
    select project_id_optional into __project_id_optional from funding_source
      where id = (select fs_id from investment_action_category where id = new.iac_id);

    if __project_id_optional = 'N' then
      raise exception 'The funding source project id is not optional for the selected funding source.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists project_funding_source_val on biohub.project_funding_source;
create trigger project_funding_source_val before insert or update on biohub.project_funding_source for each row execute procedure tr_project_funding_source();