import { Knex } from 'knex';

/**
 * Makes the lead biologist properties on a survey nullable, since the app no longer supports
 * entering or editing biologists; Updates the survey delete procedure to delete from survey_location
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    ALTER TABLE survey
    ALTER COLUMN lead_first_name       DROP NOT NULL,
    ALTER COLUMN lead_last_name        DROP NOT NULL;

    COMMENT ON COLUMN survey.lead_first_name IS '(Deprecated) The first name of the person who is the lead for the survey.';
    COMMENT ON COLUMN survey.lead_last_name IS '(Deprecated) The last name of the person who is the lead for the survey.';

    --- Update survey delete procedure

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
      -- curtis.upshall@quartech.com
      --                  2023-08-24  delete partnerships
      -- curtis.upshall@quartech.com
      --                  2023-08-24  delete survey blocks and stratums and participation
      -- curtis.upshall@quartech.com
      --                  2023-09-25  delete survey observations
      -- alfred.rosenthal@quartech.com
      --                  2023-09-25  delete survey critters
      -- *******************************************************************
      declare

      begin
        with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id), submission_spatial_components as (select submission_spatial_component_id from submission_spatial_component
        where occurrence_submission_id in (select occurrence_submission_id from occurrence_submissions))
        delete from spatial_transform_submission where submission_spatial_component_id in (select submission_spatial_component_id from submission_spatial_components);
        delete from submission_spatial_component where occurrence_submission_id in (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id);

        with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id), submission_statuses as (select submission_status_id from submission_status
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
        delete from survey_spatial_component where survey_id = p_survey_id;
        delete from survey_metadata_publish where survey_id = p_survey_id;
        delete from survey_region where survey_id = p_survey_id;
        delete from survey_first_nation_partnership where survey_id = p_survey_id;
        delete from survey_block where survey_id = p_survey_id;
        delete from permit where survey_id = p_survey_id;
        delete from survey_type where survey_id = p_survey_id;
        delete from survey_first_nation_partnership where survey_id = p_survey_id;
        delete from survey_stakeholder_partnership where survey_id = p_survey_id;
        delete from survey_participation where survey_id = p_survey_id;
        delete from survey_stratum where survey_id = p_survey_id;
        delete from survey_block where survey_id = p_survey_id;
        delete from survey_site_strategy where survey_id = p_survey_id;
        delete from survey_observation where survey_id = p_survey_id;
        delete from survey_location where survey_id = p_survey_id;
        delete from deployment where critter_id IN (select critter_id from critter where survey_id = p_survey_id);
        delete from critter where survey_id = p_survey_id;

        -- delete the survey
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
