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

  CREATE TABLE occurrence_submission_publish(
    occurrence_submission_publish_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    occurrence_submission_id            integer           NOT NULL,
    event_timestamp                     timestamptz(6)    NOT NULL,
    queue_id                            integer           NOT NULL,
    create_date                         timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                         integer           NOT NULL,
    update_date                         timestamptz(6),
    update_user                         integer,
    revision_count                      integer           DEFAULT 0 NOT NULL,
    CONSTRAINT occurrence_submission_publish_pk PRIMARY KEY (occurrence_submission_publish_id)
  );

  COMMENT ON COLUMN occurrence_submission_publish.occurrence_submission_publish_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN occurrence_submission_publish.occurrence_submission_id IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN occurrence_submission_publish.event_timestamp IS 'The timestamp of the associated event.';
  COMMENT ON COLUMN occurrence_submission_publish.queue_id IS 'The job queue identifier returned from the BioHub collection system.';
  COMMENT ON COLUMN occurrence_submission_publish.create_date IS 'The datetime the record was created.';
  COMMENT ON COLUMN occurrence_submission_publish.create_user IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN occurrence_submission_publish.update_date IS 'The datetime the record was updated.';
  COMMENT ON COLUMN occurrence_submission_publish.update_user IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN occurrence_submission_publish.revision_count IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE occurrence_submission_publish IS 'Provides a history of survey occurrence submission publish events to BioHub data collection systems.';

  create trigger audit_project_attachment_publish before insert or update or delete on biohub.project_attachment_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_project_metadata_publish before insert or update or delete on biohub.project_metadata_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_project_report_publish before insert or update or delete on biohub.project_report_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_survey_attachment_publish before insert or update or delete on biohub.survey_attachment_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_survey_metadata_publish before insert or update or delete on biohub.survey_metadata_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_survey_report_publish before insert or update or delete on biohub.survey_report_publish for each row execute procedure tr_audit_trigger();
  create trigger audit_occurrence_submission_publish before insert or update or delete on biohub.occurrence_submission_publish for each row execute procedure tr_audit_trigger();

  create trigger journal_project_attachment_publish after insert or update or delete on biohub.project_attachment_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_project_metadata_publish after insert or update or delete on biohub.project_metadata_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_project_report_publish after insert or update or delete on biohub.project_report_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_survey_attachment_publish after insert or update or delete on biohub.survey_attachment_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_survey_metadata_publish after insert or update or delete on biohub.survey_metadata_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_survey_report_publish after insert or update or delete on biohub.survey_report_publish for each row execute procedure tr_journal_trigger();
  create trigger journal_occurrence_submission_publish after insert or update or delete on biohub.occurrence_submission_publish for each row execute procedure tr_journal_trigger();

  set search_path=biohub_dapi_v1;  
  
  create or replace view occurrence_submission_publish as select * from biohub.occurrence_submission_publish;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
