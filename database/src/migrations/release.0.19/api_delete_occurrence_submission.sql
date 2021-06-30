-- api_delete_occurrence_submission.sql
drop procedure if exists api_delete_occurrence_submission;

create or replace procedure api_delete_occurrence_submission(__occurrence_submission_id occurrence_submission.id%type)
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
  __is_published boolean;
  __is_system_administrator boolean;
begin
  select exists into __is_published (select 1 from survey_status ss, occurrence_submission os 
    where os.id = __occurrence_submission_id
    and ss.survey_id = os.s_id
    and ss.survey_status = (select api_get_character_system_constant('SURVEY_STATE_PUBLISHED')));

  if __is_published then
    select api_user_is_administrator() into __is_system_administrator;

    if  not __is_system_administrator then
      raise exception 'Delete cannot proceed as published occurrence submissions exist and user is not a member of the system administrator role.';
    end if;
  end if;

  delete from submission_message where subs_id in (select id from submission_status where os_id = __occurrence_submission_id);
  delete from submission_status where os_id = __occurrence_submission_id;
  delete from occurrence where os_id = __occurrence_submission_id;
  delete from occurrence_submission where id = __occurrence_submission_id;
  
exception
  when others THEN
    raise;    
end;
$$;