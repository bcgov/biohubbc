import { Knex } from 'knex';

/**
 * Added survey_attachment_keyx table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  ----------------------------------------------------------------------------------------
  -- Create survey_attachment_keyx table
  ----------------------------------------------------------------------------------------
  set search_path=biohub;

  CREATE TABLE survey_attachment_keyx(
    survey_attachment_keyx_id       integer     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    survey_attachment_id            integer     NOT NULL,
    processed_at                    timestamptz(6),
  );
  
  COMMENT ON COLUMN survey_attachment_keyx.survey_attachment_keyx_id       IS 'System generated surrogate primary key identifier.';
  COMMENT ON COLUMN survey_attachment_keyx.survey_attachment_id            IS 'The id of the survey attachment.';
  COMMENT ON COLUMN survey_attachment_keyx.processed_at                    IS 'The datetime the record was processed and sent to BCTW.';

  COMMENT ON TABLE  survey_attachment_keyx                          IS 'Tracks keyx files that have been uploaded as a survey attachment and the time that they were sent to BCTW';

  -- Add foreign key constraint from child table to parent table on survey_attachment_id
  ALTER TABLE survey_attachment_keyx ADD CONSTRAINT survey_attachment_keyx_fk1
    FOREIGN KEY (survey_attachment_id)
    REFERENCES survey_attachment(survey_attachment_id);

  -- Add foreign key index
  CREATE INDEX survey_attachment_keyx_idx1 ON survey_attachment_keyx(survey_attachment_id);

  -- Add unique constraint
  CREATE UNIQUE INDEX survey_attachment_keyx_uk1 ON survey_attachment_keyx(survey_attachment_id);

  ----------------------------------------------------------------------------------------
  -- Create View
  ----------------------------------------------------------------------------------------
  set search_path=biohub_dapi_v1;

  create or replace view survey_attachment_keyx as select * from biohub.survey_attachment_keyx;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
