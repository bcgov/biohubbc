-- tr_project.sql
create or replace function tr_project() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_project
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-05-13  initial release
-- *******************************************************************
begin
  -- ensure end date is not before start date
  if new.end_date is not null then
    if new.end_date < new.start_date then    
      raise exception 'The project start date cannot be greater than the end date.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists project_val on biohub.project;
create trigger project_val before insert or update on biohub.project for each row execute procedure tr_project();