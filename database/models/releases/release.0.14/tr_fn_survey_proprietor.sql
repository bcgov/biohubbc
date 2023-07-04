-- tr_fn_survey_proprietor.sql
create or replace function tr_fn_survey_proprietor() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_fn_survey_proprietor
-- Purpose: performs specific data validation on survey proprietor
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-01-03  initial release
-- *******************************************************************
declare
  __is_first_nation proprietor_type.is_first_nation%type;
begin
  -- ensure that survey proprietor records have correct type when associated with first nations
  if new.fn_id is not null then    
    select is_first_nation into __is_first_nation from proprietor_type
      where id = new.prt_id;

    if not __is_first_nation then
      raise exception 'The proprietor type must be of type first nations if survey is associated with a first nations group.';
    end if;
  end if;

  if new.fn_id is null then    
    select is_first_nation into __is_first_nation from proprietor_type
      where id = new.prt_id;

    if __is_first_nation then
      raise exception 'The proprietor type must be associated with a first nations group if survey has first nations proprietor type.';
    end if;

    -- no first nations selected so ensure proprietor name is provided
    if new.proprietor_name is null then
      raise exception 'The proprietor name is a required field when there is no associated first nations.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists fn_survey_proprietor_val on biohub.survey_proprietor;
create trigger fn_survey_proprietor_val before insert or update on biohub.survey_proprietor for each row execute procedure tr_fn_survey_proprietor();