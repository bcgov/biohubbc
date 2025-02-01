import { Knex } from 'knex';

/**
 * Drops the biohub_dapi_v1 schema and all its objects.
 *
 * This schema only contained views and is no longer needed.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA biohub_dapi_v1 CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
