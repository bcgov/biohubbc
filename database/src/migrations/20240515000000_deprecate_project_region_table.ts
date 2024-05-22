import { Knex } from 'knex';

/**
 * Drop the project region table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    DROP VIEW IF EXISTS biohub_dapi_v1.project_region;
    DROP TABLE IF EXISTS biohub.project_region;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
