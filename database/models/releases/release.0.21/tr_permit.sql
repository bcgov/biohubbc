-- tr_permit.sql
create or replace function tr_permit() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_permit
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-05-13  initial release
-- *******************************************************************
declare
  _project_id survey.project_id%type;
begin
  -- ensure project and survey are actually related
  if new.survey_id is not null then    
    select project_id into _project_id from survey
      where survey_id = new.survey_id;

    if _project_id != new.project_id then
      raise exception 'The project of the selected permit association is not associated with the survey.';
    end if;
  end if;

  if (new.project_id is null) and (new.survey_id is null) then
    if (new.coordinator_first_name is null) or (new.coordinator_last_name is null) or (new.coordinator_email_address is null) or (new.coordinator_agency_name is null) then
      raise exception 'Coordinator contact information is required for permits not assocaited with a survey or project.';
    end if;
  end if;

  if new.end_date is not null then
    if new.end_date < new.issue_date then    
      raise exception 'The permit issue date cannot be greater than end date.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists permit_val on biohub.permit;
create trigger permit_val before insert or update on biohub.permit for each row execute procedure tr_permit();