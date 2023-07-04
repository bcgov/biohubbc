-- api_delete_survey.sql
drop procedure if exists api_delete_survey;

create or replace procedure api_delete_survey(__survey_id survey.id%type)
language plpgsql
security definer
as 
$$
-- *******************************************************************
-- Procedure: api_delete_survey
-- Purpose: deletes a survey and dependencies
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- shreyas.devalapurkar@quartech.com
--                  2021-06-18  initial release
-- charlie.garrettjones@quartech.com
--                  2021-06-21  added occurrence submission delete
-- *******************************************************************
declare
  v_id occurrence_submission.id%type;
begin
  for v_id in (select id from occurrence_submission where s_id = __survey_id) loop
    call api_delete_occurrence_submission(v_id);
  end loop;

  delete from survey_proprietor where s_id = __survey_id;
  delete from survey_attachment where s_id = __survey_id;
  delete from study_species where s_id = __survey_id;
  delete from survey_funding_source where s_id = __survey_id;

exception
  when others THEN
    raise;    
end;
$$;