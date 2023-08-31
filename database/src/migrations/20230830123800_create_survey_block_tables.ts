import { Knex } from 'knex';

/**
 * Adds a new table for creating blocks, which are associated to surveys;
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create new survey_block table
  ----------------------------------------------------------------------------------------

  SET search_path=biohub;

  CREATE TABLE survey_block(
      survey_block_id                     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                           integer           NOT NULL,
      name                                varchar(300),
      description                         varchar(3000),
      create_date                         timestamptz(6)    DEFAULT now() NOT NULL,
      create_user                         integer           NOT NULL,
      update_date                         timestamptz(6),
      update_user                         integer,
      revision_count                      integer           DEFAULT 0 NOT NULL,
      CONSTRAINT survey_block_pk PRIMARY KEY (survey_block_id)
  );
  
  COMMENT ON COLUMN survey_block.survey_block_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_block.survey_id IS 'System generated surrogate primary key identifier.'
  ;
  COMMENT ON COLUMN survey_block.name IS 'The name of the block.'
  ;
  COMMENT ON COLUMN survey_block.description IS 'The description of the block.'
  ;
  COMMENT ON COLUMN survey_block.create_date IS 'The datetime the record was created.'
  ;
  COMMENT ON COLUMN survey_block.create_user IS 'The id of the user who created the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_block.update_date IS 'The datetime the record was updated.'
  ;
  COMMENT ON COLUMN survey_block.update_user IS 'The id of the user who updated the record as identified in the system user table.'
  ;
  COMMENT ON COLUMN survey_block.revision_count IS 'Revision count used for concurrency control.'
  ;
  COMMENT ON TABLE survey_block IS 'blocks associated with a given survey.'
  ;


  ----------------------------------------------------------------------------------------
  -- Create new keys and indices
  ----------------------------------------------------------------------------------------

  -- Add foreign key constraint from child table to parent table on survey_id
  ALTER TABLE survey_block ADD CONSTRAINT survey_block_fk1
    FOREIGN KEY (survey_id)
    REFERENCES survey(survey_id);

  -- Add foreign key index
  CREATE INDEX survey_block_idx1 ON survey_block(survey_id);

  -- Add unique constraint

  CREATE UNIQUE INDEX survey_block_uk1 ON survey_block(name, survey_id);

  -- Create audit and journal triggers
  create trigger audit_survey_block before insert or update or delete on survey_block for each row execute procedure tr_audit_trigger();
  create trigger journal_survey_block after insert or update or delete on survey_block for each row execute procedure tr_journal_trigger();


  ----------------------------------------------------------------------------------------
  -- Create views
  ----------------------------------------------------------------------------------------

  set search_path=biohub_dapi_v1;

  create or replace view survey_block as select * from biohub.survey_block;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
