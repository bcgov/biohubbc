import { Knex } from 'knex';

/**
 * Drops the n8n schema and all its objects.
 *
 * This schema was used for the n8n workflow automation tool which was only ever a proof of concept, and has been long
 * deprecated.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA n8n CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
