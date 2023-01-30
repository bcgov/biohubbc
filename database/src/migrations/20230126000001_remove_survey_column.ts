import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * remove 'surveyed_all_areas' from survey table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path= ${DB_SCHEMA_DAPI_V1};
    drop view survey;

    set search_path=${DB_SCHEMA};

    alter table survey drop column surveyed_all_areas;

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    create or replace view survey as select * from ${DB_SCHEMA}.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
