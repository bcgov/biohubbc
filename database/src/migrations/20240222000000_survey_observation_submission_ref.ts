import { Knex } from 'knex';

/**
 * Added survey_observation table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create survey_observation_submission_ref table
  ----------------------------------------------------------------------------------------
  set search_path=biohub;
  CREATE TABLE survey_observation_submission_ref (
    survey_observation_submission_ref_id    integer           NOT NULL,
    survey_observation_id                   integer           NOT NULL,
    submission_id                           integer           NOT NULL,
    create_date                             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                             integer           NOT NULL,
    update_date                             timestamptz(6),
    update_user                             integer,
    CONSTRAINT survey_observation_submission_ref_pk PRIMARY KEY (survey_observation_submission_ref_id)
  );

  COMMENT ON COLUMN survey_observation_submission_ref.survey_observation_submission_ref_id    IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_observation_submission_ref.survey_observation_id                   IS 'The survey observation id of the survey observation reference.';
  COMMENT ON COLUMN survey_observation_submission_ref.submission_id                           IS 'The submission identifier for the observation reference.';
  COMMENT ON COLUMN survey_observation_submission_ref.create_date                             IS 'The date the survey observation reference was created.';
  COMMENT ON COLUMN survey_observation_submission_ref.create_user                             IS 'The user id of the survey observation reference creator.';
  COMMENT ON COLUMN survey_observation_submission_ref.update_date                             IS 'The date the survey observation reference was updated.';
  COMMENT ON COLUMN survey_observation_submission_ref.update_user                             IS 'The user id of the survey observation reference updater.';
  COMMENT ON TABLE  survey_observation_submission_ref                                         IS 'Survey observation reference table';
  
  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on submission_id
  ALTER TABLE survey_observation_submission_ref ADD CONSTRAINT survey_observation_submission_ref_fk1
    FOREIGN KEY (survey_observation_id)
    REFERENCES survey_observation(survey_observation_id);

  ALTER TABLE survey_observation_submission_ref ADD CONSTRAINT survey_observation_submission_ref_fk2
    FOREIGN KEY (submission_id)
    REFERENCES survey_observation_submission(submission_id);
    
  -- Add foreign key index
  CREATE INDEX survey_observation_submission_ref_idx1 ON survey_observation_submission_ref(survey_observation_id);
  CREATE INDEX survey_observation_submission_ref_idx2 ON survey_observation_submission_ref(submission_id);

  ----------------------------------------------------------------------------------------
  -- Create View
  ----------------------------------------------------------------------------------------
  set search_path=biohub_dapi_v1;
  create or replace view survey_observation_submission_ref as select * from biohub.survey_observation_submission_ref;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
