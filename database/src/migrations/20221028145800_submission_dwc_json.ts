import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

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

    SET SEARCH_PATH = biohub_dapi_v1;
    create or replace view occurrence_submission as select * from ${DB_SCHEMA}.occurrence_submission;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
