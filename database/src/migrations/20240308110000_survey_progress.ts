import { Knex } from 'knex';

/**
 * Create new tables with initial seed data:
 * - survey_progress
 *
 * Update existing tables:
 * - Add 'progress' column to Survey table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create survey progress lookup table
    ----------------------------------------------------------------------------------------
    SET search_path = biohub;

    CREATE TABLE survey_progress (
      survey_progress_id                            integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(128),
      record_end_date                               timestamptz(6),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_progress_id_pk PRIMARY KEY (survey_progress_id)
    );

    COMMENT ON TABLE survey_progress IS 'This table is intended to store options that users can select for their survey status.';
    COMMENT ON COLUMN survey_progress.survey_progress_id IS 'Primary key for survey_progress.';
    COMMENT ON COLUMN survey_progress.name IS 'Name of the survey progress option.';
    COMMENT ON COLUMN survey_progress.description IS 'Description of the survey progress option.';
    COMMENT ON COLUMN survey_progress.record_end_date IS 'End date of the survey progress option.';
    COMMENT ON COLUMN survey_progress.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_progress.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_progress.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_progress.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_progress.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Add triggers for user data
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_survey_progress BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_progress FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_progress AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_progress FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Modify survey table to include survey_progress
    ----------------------------------------------------------------------------------------
    ALTER TABLE survey ADD COLUMN progress_id INTEGER NOT NULL;
    COMMENT ON COLUMN survey.progress_id IS 'Foreign key referencing the progress value.';
    ALTER TABLE survey ADD CONSTRAINT survey_progress_fk FOREIGN KEY (progress_id) REFERENCES survey_progress(survey_progress_id);
    
    ----------------------------------------------------------------------------------------
    -- Add initial values
    ----------------------------------------------------------------------------------------
    INSERT INTO survey_progress (name, description)
    VALUES
    (
      'Planning',
      'The Survey is being planned and may change.'
    );

    ----------------------------------------------------------------------------------------
    -- Add view for survey_progress table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE VIEW survey_progress AS (SELECT * FROM biohub.survey_progress);

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
