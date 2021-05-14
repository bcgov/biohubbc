-- tr_study_species.sql
create or replace function tr_study_species() returns trigger
language plpgsql
security invoker
as
$$
-- *******************************************************************
-- Procedure: tr_study_species
-- Purpose: performs specific data validation
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-05-13  initial release
-- *******************************************************************
declare
  __p_id survey.p_id%type;
begin
  -- ensure project and survey are actually related
  if new.s_id is not null then    
    select p_id into __p_id from survey
      where id = new.s_id;

    if __p_id != new.p_id then
      raise exception 'The project of the selected project species association is not associated with the survey.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists study_species_val on biohub.study_species;
create trigger study_species_val before insert or update on biohub.study_species for each row execute procedure tr_study_species();