import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add `occurrence_submission.` column and update `occurrence_submission` view.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=${DB_SCHEMA};

    alter table occurrence_submission add column darwin_core_source jsonb;
    comment on column occurrence_submission.darwin_core_source is 'Contains JSON source of Darwin Core file uploaded';

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    create or replace view occurrence_submission as select * from ${DB_SCHEMA}.occurrence_submission;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
