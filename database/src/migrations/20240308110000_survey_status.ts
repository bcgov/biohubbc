import { Knex } from 'knex';

/**
 * Create new tables:
 * - survey_status
 * - observation_subcount_qualitative_measurement
 *
 * Drop old tables:
 * - subcount_event
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create survey status lookup table
    ----------------------------------------------------------------------------------------
    CREATE TABLE survey_status (
      survey_status_id                       integer            NOT NULL,
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(128),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      
      CONSTRAINT survey_status_id_pk PRIMARY KEY (survey_status_id)
    );

    COMMENT ON TABLE survey_status IS 'This table is intended to track quantitative measurements applied to a particular observation_subcount';
    COMMENT ON COLUMN survey_status.survey_status_id IS 'Primary key for survey_status.';
    COMMENT ON COLUMN survey_status.name IS 'Name of the survey status option.';
    COMMENT ON COLUMN survey_status.description IS 'Description of the survey status option.';
    COMMENT ON COLUMN survey_status.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_status.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_status.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_status.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_status.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- add triggers for user data
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_survey_status BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_status FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_status AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_status FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
  
    ----------------------------------------------------------------------------------------
    -- Modify survey table to include survey_status
    ----------------------------------------------------------------------------------------
    ALTER TABLE survey ADD COLUMN status INTEGER;
    ALTER TABLE survey ADD CONSTRAINT survey_status_fk FOREIGN KEY (status) REFERENCES survey_status(survey_status_id)
  
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
