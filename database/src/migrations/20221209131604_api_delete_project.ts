import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  CREATE OR REPLACE PROCEDURE api_delete_project(p_project_id integer)
  LANGUAGE plpgsql
  SECURITY DEFINER
 AS $procedure$
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
 --                  2022-09-07  changes to permit model
 --                  2022-12-20  delete security
 -- *******************************************************************
 declare
     _survey_id survey.survey_id%type;
   begin
     for _survey_id in (select survey_id from survey where project_id = p_project_id) loop
       call api_delete_survey(_survey_id);
     end loop;
 
     delete from survey where project_id = p_project_id;
     delete from stakeholder_partnership where project_id = p_project_id;
     delete from project_activity where project_id = p_project_id;
     delete from project_climate_initiative where project_id = p_project_id;
     delete from project_management_actions where project_id = p_project_id;
     delete from project_funding_source where project_id = p_project_id;
     delete from project_iucn_action_classification where project_id = p_project_id;
     delete from project_attachment where project_id = p_project_id;
     delete from project_report_author where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
     delete from project_report_attachment where project_id = p_project_id;
     delete from project_first_nation where project_id = p_project_id;
     delete from project_participation where project_id = p_project_id;
     delete from project where project_id = p_project_id;
 
 exception
   when others THEN
     raise;    
 end;
 $procedure$;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  `);
}
