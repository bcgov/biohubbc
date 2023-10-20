import { Knex } from 'knex';

/**
 * Added new funding source and survey funding tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  -------------------------------------------------------------------------
  -- Drop existing views
  -------------------------------------------------------------------------
  SET SEARCH_PATH=biohub_dapi_v1;

  DROP VIEW IF EXISTS survey_funding_source;

  -------------------------------------------------------------------------
  -- Drop existing indexes/constraints
  -------------------------------------------------------------------------
  SET SEARCH_PATH=biohub, public;

  ALTER TABLE survey_funding_source DROP CONSTRAINT survey_funding_source_pk;
  DROP INDEX survey_funding_source_uk1;

  -------------------------------------------------------------------------
  -- Rename survey_funding_source to survey_funding_source_old
  -------------------------------------------------------------------------
  ALTER TABLE survey_funding_source RENAME TO survey_funding_source_old;

  -------------------------------------------------------------------------
  -- Create funding source and join table
  -------------------------------------------------------------------------
  CREATE TABLE funding_source(
    funding_source_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)      NOT NULL,
    description              varchar(250)      NOT NULL,
    start_date               date,
    end_date                 date,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT funding_source_pk PRIMARY KEY (funding_source_id)
  );

  COMMENT ON COLUMN funding_source.funding_source_id        IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN funding_source.name                     IS 'The name of the funding source.';
  COMMENT ON COLUMN funding_source.description              IS 'The description of the funding source.';
  COMMENT ON COLUMN funding_source.start_date               IS 'Funding start date.';
  COMMENT ON COLUMN funding_source.end_date                 IS 'Funding end date.';
  COMMENT ON COLUMN funding_source.record_effective_date    IS 'Record level effective date.';
  COMMENT ON COLUMN funding_source.record_end_date          IS 'Record level end date.';
  COMMENT ON COLUMN funding_source.create_date              IS 'The datetime the record was created.';
  COMMENT ON COLUMN funding_source.create_user              IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN funding_source.update_date              IS 'The datetime the record was updated.';
  COMMENT ON COLUMN funding_source.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN funding_source.revision_count           IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  funding_source                          IS 'Funding Source.';

  CREATE TABLE survey_funding_source(
    survey_funding_source_id              integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    funding_source_id                     integer           NOT NULL,
    survey_id                             integer           NOT NULL,
    amount                                money             NOT NULL,
    create_date                           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                           integer           NOT NULL,
    update_date                           timestamptz(6),
    update_user                           integer,
    revision_count                        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT survey_funding_source_pk PRIMARY KEY (survey_funding_source_id)
  );

  COMMENT ON COLUMN survey_funding_source.survey_funding_source_id            IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_funding_source.funding_source_id                   IS 'The id of the funding source.';
  COMMENT ON COLUMN survey_funding_source.survey_id                           IS 'The id of the survey.';
  COMMENT ON COLUMN survey_funding_source.amount                              IS 'The amount of money from the funding source being used by the survey.';
  COMMENT ON COLUMN survey_funding_source.create_date                         IS 'the datetime the record was created';
  COMMENT ON COLUMN survey_funding_source.create_user                         IS 'The id of the user who created the record as identified in the system user table.';
  COMMENT ON COLUMN survey_funding_source.update_date                         IS 'The datetime the record was updated.';
  COMMENT ON COLUMN survey_funding_source.update_user                         IS 'The id of the user who updated the record as identified in the system user table.';
  COMMENT ON COLUMN survey_funding_source.revision_count                      IS 'Revision count used for concurrency control.';
  COMMENT ON TABLE  survey_funding_source                                     IS 'A join table for project roles and their permissions.';

  -------------------------------------------------------------------------
  -- Create audit and journal triggers for new tables
  -------------------------------------------------------------------------
  CREATE TRIGGER audit_funding_source BEFORE INSERT OR UPDATE OR DELETE ON funding_source for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_funding_source AFTER INSERT OR UPDATE OR DELETE ON funding_source for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  CREATE TRIGGER audit_survey_funding_source BEFORE INSERT OR UPDATE OR DELETE ON survey_funding_source for each ROW EXECUTE PROCEDURE tr_audit_trigger();
  CREATE TRIGGER journal_survey_funding_source AFTER INSERT OR UPDATE OR DELETE ON survey_funding_source for each ROW EXECUTE PROCEDURE tr_journal_trigger();

  ----------------------------------------------------------------------------------------
  -- Create Indexes and Constraints for new tables
  ----------------------------------------------------------------------------------------

  ALTER TABLE survey_funding_source ADD CONSTRAINT survey_funding_source_fk1
  FOREIGN KEY (funding_source_id)
  REFERENCES funding_source(funding_source_id);

  ALTER TABLE survey_funding_source ADD CONSTRAINT survey_funding_source_fk2
  FOREIGN KEY (survey_id)
  REFERENCES survey(survey_id);

  -- Add unique end-date key constraint (don't allow 2 entities with the same name and a NULL record_end_date)
  CREATE UNIQUE INDEX funding_source_nuk1 ON funding_source(name, (record_end_date is NULL)) where record_end_date is null;

  -- Add indexes on foreign key columns
  CREATE INDEX survey_funding_source_idx1 ON survey_funding_source(funding_source_id);
  CREATE INDEX survey_funding_source_idx2 ON survey_funding_source(survey_id);

  ----------------------------------------------------------------------------------------
  -- Insert old data into new tables
  ----------------------------------------------------------------------------------------
  -- Funding Source
  ---- get distinct names from project_funding_source
  ---- fill in info start_date, end_date, record_effective_date from project_funding_source, investment_action_category, agency
  ---- default description to 'Placeholder, please provide description.'
  ----------------------------------------------------------------------------------------
  insert into funding_source (name, description, start_date, end_date, record_effective_date)
    select distinct on (a.name)
      a.name, 'Placeholder, please provide description.', pfs.funding_start_date, pfs.funding_end_date, iac.record_effective_date
        from project_funding_source pfs
        left join investment_action_category iac on pfs.investment_action_category_id = iac.investment_action_category_id
        left join agency a on a.agency_id = iac.agency_id
        where a.name is not null;


  ----------------------------------------------------------------------------------------
  -- Survey Funding Source
  ---- get funding_source_id from funding_source
  ---- get survey_id from project_funding_source
  ---- get amount from project_funding_source
  ----------------------------------------------------------------------------------------
  insert into survey_funding_source (funding_source_id, survey_id, amount)
    select fs.funding_source_id, id_amount.survey_id, id_amount.funding_amount
      from funding_source fs
      left join (
        select a.name a_name, pfs.funding_amount, sfso.survey_id
          from project_funding_source pfs
          left join investment_action_category iac on pfs.investment_action_category_id = iac.investment_action_category_id
          left join agency a on a.agency_id = iac.agency_id
          left join survey_funding_source_old sfso on pfs.project_funding_source_id = sfso.project_funding_source_id
          where a.name is not null
          and sfso.survey_id is not null
      ) id_amount on fs.name = id_amount.a_name
      where id_amount.survey_id is not null;

  ----------------------------------------------------------------------------------------
  -- Create views / Drop old tables
  ----------------------------------------------------------------------------------------
  SET SEARCH_PATH=biohub_dapi_v1;
  CREATE OR REPLACE VIEW funding_source AS SELECT * FROM biohub.funding_source;
  CREATE OR REPLACE VIEW survey_funding_source AS SELECT * FROM biohub.survey_funding_source;

  DROP VIEW IF EXISTS biohub_dapi_v1.survey_funding_source_old;
  DROP VIEW IF EXISTS biohub_dapi_v1.project_funding_source;

  SET SEARCH_PATH=biohub, public;
  DROP TABLE IF EXISTS survey_funding_source_old;
  DROP TABLE IF EXISTS project_funding_source;
 `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
