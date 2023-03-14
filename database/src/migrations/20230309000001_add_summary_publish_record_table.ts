import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub;

  CREATE TABLE survey_summary_submission_publish(
    survey_summary_submission_publish_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_summary_submission_id    integer           NOT NULL,
    event_timestamp                timestamptz(6)    NOT NULL,
    artifact_revision_id           integer           NOT NULL,
    create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                    integer           NOT NULL,
    update_date                    timestamptz(6),
    update_user                    integer,
    revision_count                 integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_summary_submission_publish_pk PRIMARY KEY (survey_summary_submission_publish_id)
  );

  COMMENT ON COLUMN survey_summary_submission_publish.survey_summary_submission_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_summary_submission_publish.survey_summary_submission_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_summary_submission_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN survey_summary_submission_publish.artifact_revision_id IS 'The artifact revision identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN survey_summary_submission_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_summary_submission_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_summary_submission_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_summary_submission_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_summary_submission_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE survey_summary_submission_publish IS 'Provides a history of survey summary publish events to BioHub data collection systems.';

  CREATE UNIQUE INDEX survey_summary_submission_publish_uk1 ON survey_summary_submission_publish(artifact_revision_id);
  CREATE INDEX "Ref213327" ON survey_summary_submission_publish(survey_summary_submission_id);

  ALTER TABLE survey_summary_submission_publish ADD CONSTRAINT "Refsurvey_summary_submission_publish231"
    FOREIGN KEY (survey_summary_submission_id)
    REFERENCES survey_summary_submission(survey_summary_submission_id);

  create trigger audit_survey_summary_submission_publish before insert or update or delete on biohub.survey_summary_submission_publish for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_summary_submission_publish after insert or update or delete on biohub.survey_summary_submission_publish for each row execute procedure tr_journal_trigger();

  set search_path=biohub_dapi_v1;

  create or replace view survey_summary_submission_publish as select * from biohub.survey_summary_submission_publish;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
