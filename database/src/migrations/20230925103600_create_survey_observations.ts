import { Knex } from 'knex';

/**
 * Creates the survey_observation table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new survey_observation table
  ----------------------------------------------------------------------------------------

  SET search_path=biohub;

  CREATE TABLE survey_observation(
    survey_observation_id                   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                               integer           NOT NULL,
    wldtaxonomic_units_id                   integer,
    latitude                                numeric(10, 7)    NOT NULL,
    longitude                               numeric(10, 7)    NOT NULL,
    count                                   integer           NOT NULL,
    observation_date                        date              NOT NULL,
    observation_time                        time              NOT NULL,
    create_date                             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                             integer           NOT NULL,
    update_date                             timestamptz(6),
    update_user                             integer,
    revision_count                          integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_observation_pk PRIMARY KEY (survey_observation_id)
  );


  COMMENT ON COLUMN survey_observation.survey_observation_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_observation.survey_id IS 'A foreign key pointing to the survey table.'
  ;
  COMMENT ON COLUMN survey_observation.wldtaxonomic_units_id IS 'The species associated with the observation.'
  ;
  COMMENT ON COLUMN survey_observation.latitude IS 'The latitude of the observation, having ten points of total precision and 7 points of precision after the decimal.'
  ;
  COMMENT ON COLUMN survey_observation.longitude IS 'The longitude of the observation, having ten points of total precision and 7 points of precision after the decimal.'
  ;
  COMMENT ON COLUMN survey_observation.count IS 'The count of the observation.'
  ;
  COMMENT ON COLUMN survey_observation.observation_date IS 'The date associated with the observation.'
  ;
  COMMENT ON COLUMN survey_observation.observation_time IS 'The time associated with the observation.'
  ;
  COMMENT ON COLUMN survey_observation.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_observation.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_observation.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_observation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_observation.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_observation IS 'Broad classification for the survey_observation code of the survey.'
  ;



  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Create audit and journal triggers
  create trigger audit_survey_observation before insert or update or delete on survey_observation for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_observation after insert or update or delete on survey_observation for each row execute procedure tr_journal_trigger();

  -- add foreign key constraints
  ALTER TABLE survey_observation ADD CONSTRAINT survey_observation_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- add indexes for foreign keys
  CREATE INDEX survey_observation_idx1 ON survey_observation(survey_id);



  ----------------------------------------------------------------------------------------
  -- Create new views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_observation as select * from biohub.survey_observation;



  ----------------------------------------------------------------------------------------
  -- Update api_delete_survey procedure
  ----------------------------------------------------------------------------------------

  set search_path=biohub;

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
     -- *******************************************************************
     declare

     begin
      with occurrence_submissions as (select occurrence_submission_id from occurrence_submission where survey_id = p_survey_id), submission_spatial_components as (select submission_spatial_component_id from submission_spatial_component
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
