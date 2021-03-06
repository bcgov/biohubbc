-- api_delete_project.sql
drop procedure if exists api_delete_project;

create or replace procedure api_delete_project(__project_id project.id%type)
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
  v_id survey.id%type;
begin
  for v_id in (select id from survey where p_id = __project_id) loop
    call api_delete_survey(v_id);
  end loop;

  delete from survey_proprietor where s_id in (select id from survey where p_id = __project_id);
  delete from survey_attachment where s_id in (select id from survey where p_id = __project_id);
  delete from study_species where s_id in (select id from survey where p_id = __project_id);
  delete from permit where p_id = __project_id;
  delete from survey where p_id = __project_id;
  delete from stakeholder_partnership where p_id = __project_id;
  delete from project_activity where p_id = __project_id;
  delete from project_climate_initiative where p_id = __project_id;
  delete from project_region where p_id = __project_id;
  delete from project_management_actions where p_id = __project_id;
  delete from project_funding_source where p_id = __project_id;
  delete from project_iucn_action_classification where p_id = __project_id;
  delete from project_attachment where p_id = __project_id;
  delete from project_first_nation where p_id = __project_id;
  delete from project_participation where p_id = __project_id;
  delete from project where id = __project_id;

exception
  when others THEN
    raise;    
end;
$$;
