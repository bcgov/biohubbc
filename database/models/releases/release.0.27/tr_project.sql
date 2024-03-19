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
--                  2021-09-17  added checks for admin role to un-publish or delete published projects
-- *******************************************************************
begin
  -- ensure end date is not before start date
  if (TG_OP = 'INSERT') or (TG_OP = 'UPDATE') then
    if new.end_date is not null then
      if new.end_date < new.start_date then    
        raise exception 'The project start date cannot be greater than the end date.';
      end if;
    end if;

    if (TG_OP = 'UPDATE') then
      -- once public then only administrators can adjust the publish timestamp
      if old.publish_timestamp is not null and new.publish_timestamp is null and not api_user_is_administrator(api_get_context_user_id()) then
        raise exception 'User requires administrator role to unset published state of project.';
      end if;
    end if;
  elsif (TG_OP = 'DELETE') then
    -- once public then only administrators can delete
    if not api_user_is_administrator(api_get_context_user_id()) then
      raise exception 'User requires administrator role to delete published project.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists project_val on biohub.project;
create trigger project_val before insert or update or delete on biohub.project for each row execute procedure tr_project();