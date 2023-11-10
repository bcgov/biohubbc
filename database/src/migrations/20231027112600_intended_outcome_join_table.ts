import { Knex } from 'knex';

/**
 * @TODO doc
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  SET search_path = 'biohub';

  ------------------------------------------------------------------------
  -- Create new join table to allow multiple intended outcomes per survey.
  ------------------------------------------------------------------------
  CREATE TABLE biohub.survey_intended_outcome (
    survey_id int4 NOT NULL,
    intended_outcome_id int4 NOT NULL,
    create_date timestamptz(6) NOT NULL DEFAULT now(),
    create_user int4 NOT NULL,
    update_date timestamptz(6) NULL,
    update_user int4 NULL,
    revision_count int4 NOT NULL DEFAULT 0,
    CONSTRAINT survey_intended_outcome_pk PRIMARY KEY (survey_id,intended_outcome_id),
    CONSTRAINT survey_intended_outcome_fk FOREIGN KEY (survey_id) REFERENCES biohub.survey(survey_id),
    CONSTRAINT survey_intended_outcome_fk_1 FOREIGN KEY (intended_outcome_id) REFERENCES biohub.intended_outcome(intended_outcome_id)
  );
  COMMENT ON TABLE biohub.survey_intended_outcome IS 'Join table representing surveys that may have one or more intended outcomes (also referred to as ecological variables)';
  
  -- Column comments
  
  COMMENT ON COLUMN biohub.survey_intended_outcome.survey_id IS 'Foreign key referencing a survey.';
  COMMENT ON COLUMN biohub.survey_intended_outcome.intended_outcome_id IS 'Foreign key referencing an intended outcome.';
  
  create trigger audit_survey_intended_outcome before
  insert
      or
  delete
      or
  update
      on
      biohub.survey_intended_outcome for each row execute function biohub.tr_audit_trigger();
  create trigger journal_survey_intended_outcome after
  insert
      or
  delete
      or
  update
      on
      biohub.survey_intended_outcome for each row execute function biohub.tr_journal_trigger();
  
  -----------------------------------------------------------------------------
  -- Copy existing intended outcomes from the survey table into this new table
  -----------------------------------------------------------------------------
  INSERT INTO biohub.survey_intended_outcome (survey_id, intended_outcome_id)
  SELECT survey_id, intended_outcome_id FROM survey WHERE intended_outcome_id IS NOT NULL;

  ------------------------------------------------------------------------------
  -- Remove the redundant reference to intended_outcome_id in the survey table.
  ------------------------------------------------------------------------------

  DROP VIEW biohub_dapi_v1.survey;
  -- biohub_dapi_v1.survey source
  CREATE OR REPLACE VIEW biohub_dapi_v1.survey
  AS SELECT survey.survey_id,
      survey.project_id,
      survey.field_method_id,
      survey.uuid,
      survey.name,
      survey.additional_details,
      survey.start_date,
      survey.lead_first_name,
      survey.lead_last_name,
      survey.end_date,
      survey.create_date,
      survey.create_user,
      survey.update_date,
      survey.update_user,
      survey.revision_count,
      survey.ecological_season_id,
      survey.comments
    FROM biohub.survey;

  DROP INDEX "Ref223211";
  ALTER TABLE biohub.survey DROP CONSTRAINT "Refintended_outcome190";
  ALTER TABLE biohub.survey DROP CONSTRAINT "Refintended_outcome211";
  ALTER TABLE biohub.survey DROP COLUMN intended_outcome_id;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
