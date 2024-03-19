-- api_delete_occurrence_submission.sql
drop procedure if exists api_delete_occurrence_submission;

create or replace procedure api_delete_occurrence_submission(_occurrence_submission_id occurrence_submission.occurrence_submission_id%type)
language plpgsql
security definer
as 
$$
-- *******************************************************************
-- Procedure: api_delete_occurrence_submission
-- Purpose: deletes an occurrence submission
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-06-18  initial release
-- *******************************************************************
declare
  _is_published boolean;
  _is_system_administrator boolean;
begin
  select exists into _is_published (select 1 from survey_status ss, occurrence_submission os 
    where os.occurrence_submission_id = _occurrence_submission_id
    and ss.survey_id = os.survey_id
    and ss.survey_status = (select api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED')));

  if _is_published then
    select api_user_is_administrator() into _is_system_administrator;

    if  not _is_system_administrator then
      raise exception 'Delete cannot proceed as published occurrence submissions exist and user is not a member of the system administrator role.';
    end if;
  end if;

  delete from submission_message where submission_status_id in (select submission_status_id from submission_status where occurrence_submission_id = _occurrence_submission_id);
  delete from submission_status where occurrence_submission_id = _occurrence_submission_id;
  delete from occurrence where occurrence_submission_id = _occurrence_submission_id;
  delete from occurrence_submission_data_package where occurrence_submission_id = _occurrence_submission_id;
  delete from data_package where data_package_id in (select data_package_id from occurrence_submission_data_package where occurrence_submission_id = _occurrence_submission_id);  
  delete from occurrence_submission where occurrence_submission_id = _occurrence_submission_id;
  
exception
  when others THEN
    raise;    
end;
$$;