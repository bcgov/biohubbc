import { Knex } from 'knex';

/**
 * Update the `api_delete_project` and `api_delete_survey` functions.
 * - Remove deleted `project_type` table, add new `survey_type` table.
 * - Remove deleted `project_funding_source` table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema 'biohub';
  set search_path = biohub;

  -------------------------------------------------------------------------
  -- Update api_delete_project
  -------------------------------------------------------------------------

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
   -- charlie.garrettjones@quartech.com
   --                  2021-06-21  added delete survey
   -- charlie.garrettjones@quartech.com
   --                  2022-09-07  changes to permit model
   -- charlie.garrettjones@quartech.com
   --                  2022-12-20  delete security
   -- charlie.garrettjones@quartech.com
   --                  2023-03-14  1.7.0 model changes
   -- alfred.rosenthal@quartech.com
   --                  2023-07-26 removing climate associations, delete project regions, programs, grouping
   -- nick.phura@quartech.com
   --                  2023-08-22 remove project_type, project_funding_source
   -- *******************************************************************
   declare
       _survey_id survey.survey_id%type;
     begin
       for _survey_id in (select survey_id from survey where project_id = p_project_id) loop
         call api_delete_survey(_survey_id);
       end loop;
   
       delete from survey where project_id = p_project_id;
       delete from stakeholder_partnership where project_id = p_project_id;
       delete from project_management_actions where project_id = p_project_id;
       delete from project_iucn_action_classification where project_id = p_project_id;
       delete from project_attachment_publish where project_attachment_id in (select project_attachment_id from project_attachment where project_id = p_project_id);
       delete from project_attachment where project_id = p_project_id;
       delete from project_report_author where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
       delete from project_report_publish where project_report_attachment_id in (select project_report_attachment_id from project_report_attachment where project_id = p_project_id);
       delete from project_report_attachment where project_id = p_project_id;
       delete from project_first_nation where project_id = p_project_id;
       delete from project_participation where project_id = p_project_id;
       delete from project_metadata_publish where project_id = p_project_id;
       delete from project_region where project_id = p_project_id;
       delete from project_program where project_id = p_project_id;
       delete from grouping_project where project_id = p_project_id;
       delete from project where project_id = p_project_id;
  
     exception
       when others THEN
         raise;    
   end;
  $procedure$;
 
  -------------------------------------------------------------------------
  -- Update api_delete_survey
  -------------------------------------------------------------------------
  
  CREATE OR REPLACE PROCEDURE api_delete_survey(p_survey_id integer)
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $procedure$
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
    -- kjartan.einarsson@quartech.com
    --                  2022-08-28  added survey_vantage, survey_spatial_component, survey delete
    -- charlie.garrettjones@quartech.com
    --                  2022-09-07  changes to permit model
    -- charlie.garrettjones@quartech.com
    --                  2022-10-05  1.3.0 model changes
    -- charlie.garrettjones@quartech.com
    --                  2022-10-05  1.5.0 model changes, drop concept of occurrence deletion for published data
    -- charlie.garrettjones@quartech.com
    --                  2023-03-14  1.7.0 model changes
    -- alfred.rosenthal@quartech.com
    --                  2023-03-15  added missing publish tables to survey delete
    -- curtis.upshall@quartech.com
    --                  2023-04-28  change order of survey delete procedure
    -- alfred.rosenthal@quartech.com
    --                  2023-07-26  delete regions
    -- nick.phura@quartech.com
    --                  2023-08-22  add survey_type
    -- *******************************************************************
    declare   
    begin
      with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id)
      , submission_spatial_components as (select submission_spatial_component_id from submission_spatial_component
         where occurrence_submission_id in (select occurrence_submission_id from occurrence_submissions))
      delete from spatial_transform_submission where submission_spatial_component_id in (select submission_spatial_component_id from submission_spatial_components);
      delete from submission_spatial_component where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);   
      with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id)
      , submission_statuses as (select submission_status_id from submission_status
       where occurrence_submission_id in (select occurrence_submission_id from occurrence_submissions))
      delete from submission_message where submission_status_id in (select submission_status_id from submission_statuses);
      delete from submission_status where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);   
      delete from occurrence_submission_publish where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);   
      delete from occurrence_submission where survey_id = p_survey_id;   
      delete from survey_summary_submission_publish where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
      delete from survey_summary_submission_message where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
      delete from survey_summary_submission where survey_id = p_survey_id;
      delete from survey_proprietor where survey_id = p_survey_id;
      delete from survey_attachment_publish where survey_attachment_id in (select survey_attachment_id from survey_attachment where survey_id = p_survey_id);
      delete from survey_attachment where survey_id = p_survey_id;
      delete from survey_report_author where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
      delete from survey_report_publish where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
      delete from survey_report_attachment where survey_id = p_survey_id;
      delete from study_species where survey_id = p_survey_id;
      delete from survey_funding_source where survey_id = p_survey_id;
      delete from survey_vantage where survey_id = p_survey_id;
      delete from survey_type where survey_id = p_survey_id;
      delete from survey_spatial_component where survey_id = p_survey_id;
      delete from survey_metadata_publish where survey_id = p_survey_id;
      delete from survey_region where survey_id = p_survey_id;   
      delete from permit where survey_id = p_survey_id;
      delete from survey where survey_id = p_survey_id;   
    exception
      when others THEN
        raise;
    end;
  $procedure$;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
