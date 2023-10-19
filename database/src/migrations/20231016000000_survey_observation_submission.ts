import { Knex } from 'knex';

/**
 * Added survey_observation_submission table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
  -- Create survey_observation_submission table
  ----------------------------------------------------------------------------------------
  set search_path=biohub;
  CREATE TABLE survey_observation_submission(
    submission_id                           integer           NOT NULL,
    key                                     varchar(255)      NOT NULL,
    survey_id                               integer           NOT NULL,
    original_filename                       varchar(255)      NOT NULL,
    create_date                             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                             integer           NOT NULL,
    update_date                             timestamptz(6),
    update_user                             integer,
    CONSTRAINT survey_observation_submission_pk PRIMARY KEY (submission_id)
  );
  
  COMMENT ON COLUMN survey_observation_submission.submission_id                   IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_observation_submission.key                             IS 'The key of the survey observation submission.';
  COMMENT ON COLUMN survey_observation_submission.survey_id                       IS 'The survey id of the survey observation submission.';
  COMMENT ON COLUMN survey_observation_submission.original_filename               IS 'The original filename of the survey observation submission.';
  COMMENT ON COLUMN survey_observation_submission.create_date                     IS 'The date the survey observation submission was created.';
  COMMENT ON COLUMN survey_observation_submission.create_user                     IS 'The user id of the survey observation submission creator.';
  COMMENT ON COLUMN survey_observation_submission.update_date                     IS 'The date the survey observation submission was updated.';
  COMMENT ON COLUMN survey_observation_submission.update_user                     IS 'The user id of the survey observation submission updater.';
  COMMENT ON TABLE  survey_observation_submission                                 IS 'Survey observation submission table';

  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_attachment_id
  ALTER TABLE survey_observation_submission ADD CONSTRAINT survey_observation_submission_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_observation_submission_idx1 ON survey_observation_submission(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_observation_submission_uk1 ON survey_observation_submission(key);

  -- Create audit and journal triggers
  create trigger audit_survey_observation_submission before insert or update or delete on survey_observation_submission for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_observation_submission after insert or update or delete on survey_observation_submission for each row execute procedure tr_journal_trigger();

  -- Create sequences
  CREATE SEQUENCE IF NOT EXISTS survey_observation_submission_id_seq;
  GRANT USAGE, SELECT ON SEQUENCE survey_observation_submission_id_seq TO biohub_api;

  ----------------------------------------------------------------------------------------
  -- Create View
  ----------------------------------------------------------------------------------------
  set search_path=biohub_dapi_v1;
  create or replace view survey_observation_submission as select * from biohub.survey_observation_submission;

  ----------------------------------------------------------------------------------------
  -- Deprecate occurrence_submission table
  ----------------------------------------------------------------------------------------

  set search_path=biohub;

  COMMENT ON TABLE  occurrence_submission IS '(Deprecated in favor of survey_observation_submission) Provides a historical listing of published dates and pointers to raw data versions for occurrence submissions.';

  ----------------------------------------------------------------------------------------
  -- Make optional a handful of survey_observation columns
  ----------------------------------------------------------------------------------------

  ALTER TABLE survey_observation
  ALTER COLUMN survey_sample_site_id       DROP NOT NULL,
  ALTER COLUMN survey_sample_method_id     DROP NOT NULL,
  ALTER COLUMN survey_sample_period_id     DROP NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
