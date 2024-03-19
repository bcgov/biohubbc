-- api_delete_survey.sql
drop procedure if exists api_delete_survey;

create or replace procedure api_delete_survey(p_survey_id survey.survey_id%type)
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
-- charlie.garrettjones@quartech.com
--                  2021-09-21  added survey summary submission delete
-- *******************************************************************
declare
  _occurrence_submission_id occurrence_submission.occurrence_submission_id%type;
begin
  for _occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id) loop
    call api_delete_occurrence_submission(_occurrence_submission_id);
  end loop;

  delete from survey_summary_submission_message where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
  delete from survey_summary_detail where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
  delete from survey_summary_submission where survey_id = p_survey_id;
  delete from survey_proprietor where survey_id = p_survey_id;
  delete from survey_attachment where survey_id = p_survey_id;
  delete from survey_report_author where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
  delete from survey_report_attachment where survey_id = p_survey_id;
  delete from study_species where survey_id = p_survey_id;
  delete from survey_funding_source where survey_id = p_survey_id;

  update permit set survey_id = null where survey_id = p_survey_id;

exception
  when others THEN
    raise;    
end;
$$;