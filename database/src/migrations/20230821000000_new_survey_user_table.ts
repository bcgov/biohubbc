import { Knex } from 'knex';

/**
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  -------------------------------------------------------------------------
  -- Drop existing indexes/constraints
  -------------------------------------------------------------------------
  SET SEARCH_PATH=biohub, public;

  -------------------------------------------------------------------------
  -- Create survey job and join table
  -------------------------------------------------------------------------
  CREATE TABLE survey_job(
    survey_job_id            integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    description              varchar(250)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_job_pk PRIMARY KEY (survey_job_id)
  );

  COMMENT ON COLUMN survey_job.survey_job_id            IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_job.name                     IS 'The name of the survey job.';
  COMMENT ON COLUMN survey_job.record_effective_date    IS 'Record level effective date.';
  COMMENT ON COLUMN survey_job.record_end_date          IS 'Record level end date.';
  COMMENT ON COLUMN survey_job.create_date              IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_job.create_user              IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_job.update_date              IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_job.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_job.revision_count           IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  survey_job                          IS 'Survey jobs.';

  CREATE TABLE survey_participation(
    survey_participation_id               integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                             integer           NOT NULL,
    system_user_id                        integer           NOT NULL,
    survey_job_id                         integer           NOT NULL,
    create_date                           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                           integer           NOT NULL,
    update_date                           timestamptz(6),
    update_user                           integer,
    revision_count                        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_participation_pk PRIMARY KEY (survey_participation_id)
  );

  COMMENT ON COLUMN survey_participation.survey_participation_id             IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_participation.survey_id                           IS 'The id of the survey.';
  COMMENT ON COLUMN survey_participation.system_user_id                      IS 'The id of the system user.';
  COMMENT ON COLUMN survey_participation.survey_job_id                       IS 'The id of the survey job.';
  COMMENT ON COLUMN survey_participation.create_date                         IS 'the datetime the record was created';
  COMMENT ON COLUMN survey_participation.create_user                         IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_participation.update_date                         IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_participation.update_user                         IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_participation.revision_count                      IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  survey_participation                                     IS 'A join table for survey job roles and system user.';

  -------------------------------------------------------------------------
  -- Create audit and journal triggers for new tables
  -------------------------------------------------------------------------
  CREATE TRIGGER audit_survey_job BEFORE INSERT OR UPDATE OR DELETE ON survey_job for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_survey_job AFTER INSERT OR UPDATE OR DELETE ON survey_job for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  CREATE TRIGGER audit_survey_participation BEFORE INSERT OR UPDATE OR DELETE ON survey_participation for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_survey_participation AFTER INSERT OR UPDATE OR DELETE ON survey_participation for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create Indexes and Constraints for new tables
  ----------------------------------------------------------------------------------------

  ALTER TABLE survey_participation ADD CONSTRAINT survey_participation_fk1
  FOREIGN KEY (survey_job_id)
  REFERENCES survey_job(survey_job_id);

  ALTER TABLE survey_participation ADD CONSTRAINT survey_participation_fk2
  FOREIGN KEY (survey_id)
  REFERENCES survey(survey_id);

  ALTER TABLE survey_participation ADD CONSTRAINT survey_participation_fk3
  FOREIGN KEY (system_user_id)
  REFERENCES system_user(system_user_id);

  -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
  CREATE UNIQUE INDEX survey_job_nuk1 ON survey_job(name, (record_end_date is NULL)) where record_end_date is null;

  -- Add indexes on foreign key columns
  CREATE INDEX survey_participation_idx1 ON survey_participation(survey_participation_id);
  CREATE INDEX survey_participation_idx2 ON survey_participation(survey_id);
  CREATE INDEX survey_participation_idx3 ON survey_participation(system_user_id);

  ----------------------------------------------------------------------------------------
  -- Create default data for new tables
  ----------------------------------------------------------------------------------------

  INSERT INTO survey_job (name, record_effective_date, description)
  VALUES
    ('Biologist', NOW(), 'A participant of a survey in a biologist role.'),
    ('Pilot', NOW(), 'A participant of a survey managing vehicle.');


  ----------------------------------------------------------------------------------------
  -- Create views / Drop old tables
  ----------------------------------------------------------------------------------------
  SET SEARCH_PATH=biohub_dapi_v1;
  CREATE OR REPLACE VIEW survey_job AS SELECT * FROM biohub.survey_job;
  CREATE OR REPLACE VIEW survey_participation AS SELECT * FROM biohub.survey_participation;

 `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
