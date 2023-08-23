import { Knex } from 'knex';

/**
 * Adds new survey partnerships tables
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Remove old view
  ----------------------------------------------------------------------------------------

  SET search_path=biohub_dapi_v1;
  DROP VIEW biohub_dapi_v1.stakeholder_partnership;
  DROP VIEW biohub_dapi_v1.project_first_nation;

  SET search_path=biohub;

  ----------------------------------------------------------------------------------------
  -- Remove old 'stakeholder_partnership' and 'survey_first_nation_partnership' tables
  ----------------------------------------------------------------------------------------

  DROP TABLE stakeholder_partnership;
  DROP TABLE project_first_nation;

  ----------------------------------------------------------------------------------------
  -- Create new survey_stakeholder_partnership table
  ----------------------------------------------------------------------------------------

  CREATE TABLE survey_stakeholder_partnership(
      survey_stakeholder_partnership_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                           integer           NOT NULL,
      name                                varchar(300),
      create_date                         timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                         integer           NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_stakeholder_partnership_pk PRIMARY KEY (survey_stakeholder_partnership_id)
  );
  
  COMMENT ON COLUMN survey_stakeholder_partnership.survey_stakeholder_partnership_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.name IS 'The name of the stakeholder.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_stakeholder_partnership.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_stakeholder_partnership IS 'Stakeholder partnerships associated with the project.'
  ;


  ----------------------------------------------------------------------------------------
  -- Create new survey_first_nation_partnership table
  ----------------------------------------------------------------------------------------

  CREATE TABLE survey_first_nation_partnership(
      survey_first_nation_partnership_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      first_nations_id           integer           NOT NULL,
      survey_id                  integer           NOT NULL,
      create_date                timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                integer           NOT NULL,
      update_date                timestamptz(6),
      update_user                integer,
      revision_count             integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_first_nation_partnership_pk PRIMARY KEY (survey_first_nation_partnership_id)
  );

  COMMENT ON COLUMN survey_first_nation_partnership.survey_first_nation_partnership_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.first_nations_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_first_nation_partnership.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_first_nation_partnership IS 'A associative entity that joins projects and first nations.'
  ;

  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE survey_stakeholder_partnership ADD CONSTRAINT survey_stakeholder_partnership_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  ALTER TABLE survey_first_nation_partnership ADD CONSTRAINT survey_first_nation_partnership_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_stakeholder_partnership_idx1 ON survey_stakeholder_partnership(survey_id);

  CREATE INDEX survey_first_nation_partnership_idx1 ON survey_first_nation_partnership(survey_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_stakeholder_partnership_uk1 ON survey_stakeholder_partnership(name, survey_id);

  CREATE UNIQUE INDEX survey_first_nation_partnership_uk1 ON survey_first_nation_partnership(first_nations_id, survey_id);

  -- Create audit and journal triggers
  create trigger audit_observation before insert or update or delete on survey_stakeholder_partnership for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on survey_stakeholder_partnership for each row execute procedure tr_journal_trigger();
  create trigger audit_observation before insert or update or delete on survey_first_nation_partnership for each row execute procedure tr_audit_trigger();
  create trigger journal_observation after insert or update or delete on survey_first_nation_partnership for each row execute procedure tr_journal_trigger();
  
  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_stakeholder_partnership as select * from biohub.survey_stakeholder_partnership;
  create or replace view survey_first_nation_partnership as select * from biohub.survey_first_nation_partnership;

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
