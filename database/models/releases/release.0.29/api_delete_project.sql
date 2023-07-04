-- api_delete_project.sql
drop procedure if exists api_delete_project;

create or replace procedure api_delete_project(p_project_id project.project_id%type)
language plpgsql
security definer
as 
$$
-- *******************************************************************
-- Procedure: api_delete_project
-- Purpose: deletes a project and dependencies
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-04-19  initial release
--                  2021-06-21  added delete survey
-- *******************************************************************
declare
    _survey_id survey.survey_id%type;
  begin
    for _survey_id in (select survey_id from survey where project_id = p_project_id) loop
      call api_delete_survey(_survey_id);
    end loop;

    delete from permit where project_id = p_project_id;
    delete from survey where project_id = p_project_id;
    delete from stakeholder_partnership where project_id = p_project_id;
    delete from project_activity where project_id = p_project_id;
    delete from project_climate_initiative where project_id = p_project_id;
    delete from project_management_actions where project_id = p_project_id;
    delete from project_funding_source where project_id = p_project_id;
    delete from project_iucn_action_classification where project_id = p_project_id;
    delete from project_attachment where project_id = p_project_id;
    delete from author where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
    delete from project_report_attachment where project_id = p_project_id;
    delete from project_first_nation where project_id = p_project_id;
    delete from project_participation where project_id = p_project_id;
    delete from project where project_id = p_project_id;

exception
  when others THEN
    raise;    
end;
$$;
