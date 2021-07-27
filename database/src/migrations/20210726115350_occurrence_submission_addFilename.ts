import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

--
-- TABLE: occurrence_submission
--

ALTER TABLE ${DB_SCHEMA}.occurrence_submission ADD file_name varchar(300)
;

COMMENT ON COLUMN occurrence_submission.file_name IS 'The name of the file submitted.'
;

set search_path = biohub_dapi_v1;
set role biohub_api;

create or replace view occurrence_submission as select * from biohub.occurrence_submission;

set role postgres;

  `);
}

/**
 * Drop the `file_name` column in the `occurrence_submission` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;

    ALTER TABLE occurrence_submission DROP COLUMN file_name;

  `);
}
