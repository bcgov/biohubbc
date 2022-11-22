import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`set search_path=biohub;
  
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
     --                  2022-10-05  deletion of
     -- charlie.garrettjones@quartech.com
     --                  2022-11-15  addition of security label associative tables
     -- *******************************************************************
     declare
       _occurrence_submission_id occurrence_submission.occurrence_submission_id%type;
     begin
       for _occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id) loop
         call api_delete_occurrence_submission(_occurrence_submission_id);
       end loop;
 
       delete from survey_summary_submission_message where survey_summary_submission_id in (select survey_summary_submission_id from survey_summary_submission where survey_id = p_survey_id);
       delete from survey_summary_submission where survey_id = p_survey_id;
       delete from survey_proprietor where survey_id = p_survey_id;
       delete from survey_attachment_persecution where survey_attachment_id in (select survey_attachment_id from survey_attachment where survey_id = p_survey_id);
       delete from survey_attachment_proprietary where survey_attachment_id in (select survey_attachment_id from survey_attachment where survey_id = p_survey_id);
       delete from survey_report_persecution where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
       delete from survey_report_proprietary where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
       delete from survey_occurrence_proprietary where survey_id = p_survey_id;
       delete from survey_attachment where survey_id = p_survey_id;
       delete from survey_report_author where survey_report_attachment_id in (select survey_report_attachment_id from survey_report_attachment where survey_id = p_survey_id);
       delete from survey_report_attachment where survey_id = p_survey_id;
       delete from study_species where survey_id = p_survey_id;
       delete from survey_funding_source where survey_id = p_survey_id;
       delete from survey_vantage where survey_id = p_survey_id;
       delete from survey_spatial_component where survey_id = p_survey_id;
 
       delete from permit where survey_id = p_survey_id;
       delete from survey where survey_id = p_survey_id;
 
     exception
       when others THEN
         raise;
     end;
   $procedure$;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
