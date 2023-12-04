import { Knex } from 'knex';

/**
 * Added survey_telemetry_submission table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
  -- Create survey_telemetry_submission table
  ----------------------------------------------------------------------------------------
  set search_path=biohub;
  CREATE TABLE survey_telemetry_submission(
    submission_id                           integer           NOT NULL,
    key                                     varchar(255)      NOT NULL,
    survey_id                               integer           NOT NULL,
    original_filename                       varchar(255)      NOT NULL,
    create_date                             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                             integer           NOT NULL,
    update_date                             timestamptz(6),
    update_user                             integer,
    CONSTRAINT survey_telemetry_submission_pk PRIMARY KEY (submission_id)
  );
  
  COMMENT ON COLUMN survey_telemetry_submission.submission_id                   IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_telemetry_submission.key                             IS 'The key of the survey telemetry submission.';
  COMMENT ON COLUMN survey_telemetry_submission.survey_id                       IS 'The survey id of the survey telemetry submission.';
  COMMENT ON COLUMN survey_telemetry_submission.original_filename               IS 'The original filename of the survey telemetry submission.';
  COMMENT ON COLUMN survey_telemetry_submission.create_date                     IS 'The date the survey telemetry submission was created.';
  COMMENT ON COLUMN survey_telemetry_submission.create_user                     IS 'The user id of the survey telemetry submission creator.';
  COMMENT ON COLUMN survey_telemetry_submission.update_date                     IS 'The date the survey telemetry submission was updated.';
  COMMENT ON COLUMN survey_telemetry_submission.update_user                     IS 'The user id of the survey telemetry submission updater.';
  COMMENT ON TABLE  survey_telemetry_submission                                 IS 'Survey telemetry submission table';

  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_attachment_id
  ALTER TABLE survey_telemetry_submission ADD CONSTRAINT survey_telemetry_submission_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_telemetry_submission_idx1 ON survey_telemetry_submission(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_telemetry_submission_uk1 ON survey_telemetry_submission(key);

  -- Create audit and journal triggers
  create trigger audit_survey_telemetry_submission before insert or update or delete on survey_telemetry_submission for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_telemetry_submission after insert or update or delete on survey_telemetry_submission for each row execute procedure tr_journal_trigger();

  -- Create sequences
  CREATE SEQUENCE IF NOT EXISTS survey_telemetry_submission_id_seq;
  GRANT USAGE, SELECT ON SEQUENCE survey_telemetry_submission_id_seq TO biohub_api;

  ----------------------------------------------------------------------------------------
  -- Create View
  ----------------------------------------------------------------------------------------
  set search_path=biohub_dapi_v1;
  create or replace view survey_telemetry_submission as select * from biohub.survey_telemetry_submission;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
