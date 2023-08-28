import { Knex } from 'knex';

/**
 * Added new survey stratum table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
  -- Create Survey Stratum Table
  ----------------------------------------------------------------------------------------

  set search_path=biohub;

  CREATE TABLE survey_stratum(
    survey_stratum_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_id                integer           NOT NULL,
    name                     varchar(50)       NOT NULL,
    description              varchar(250)      NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_stratum_pk PRIMARY KEY (survey_stratum_id)

  );

  COMMENT ON COLUMN survey_stratum.survey_stratum_id        IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_stratum.survey_id                IS 'The id of the survey.';
  COMMENT ON COLUMN survey_stratum.name                     IS 'The name of the stratum.';
  COMMENT ON COLUMN survey_stratum.description              IS 'Additional details of the stratum.';
  COMMENT ON COLUMN survey_stratum.create_date              IS 'The datetime the record was created.';
  COMMENT ON COLUMN survey_stratum.create_user              IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_stratum.update_date              IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_stratum.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_stratum.revision_count           IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  survey_stratum                          IS 'Information about survey stratums';


  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE survey_stratum ADD CONSTRAINT survey_stratum_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX surve_stratum_idx1 ON survey_stratum(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_stratum_uk1 ON survey_stratum(survey_id, name);

  -- Create audit and journal triggers
  create trigger audit_observation before insert or update or delete on survey_stratum for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on survey_stratum for each row execute procedure tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_stratum as select * from biohub.survey_stratum;

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
