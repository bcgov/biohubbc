-- tr_survey.sql
create or replace function tr_survey() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_survey
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-05-13  initial release
-- *******************************************************************
declare
  _project_start_date project.start_date%type;
  _project_end_date project.end_date%type;
begin
  -- start and end date validation
  if (new.end_date is not null) then
    if new.end_date < new.start_date then    
      raise exception 'The survey start date cannot be greater than the end date.';
    end if;
  end if;

  select start_date, end_date into strict _project_start_date, _project_end_date from project
    where project_id = new.project_id;

  if (new.start_date < _project_start_date) then
    raise exception 'The survey start date cannot be less than the associated project start date.';
  end if;

  if (_project_end_date is not null) and (new.end_date is not null) then
    if (new.end_date > _project_end_date) then
      raise exception 'The survey end date cannot be greater than the associated project end date.';
    end if;
  end if;

  if (_project_end_date is not null) and (new.end_date is null) then
    new.end_date = _project_end_date;
  end if;

  return new;
end;
$$;

drop trigger if exists survey_val on biohub.survey;
create trigger survey_val before insert or update on biohub.survey for each row execute procedure tr_survey();