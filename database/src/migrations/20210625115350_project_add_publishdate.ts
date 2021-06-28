import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Add the publish_timestamp.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE project ADD COLUMN publish_timestamp timestamptz(6);
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE project DROP COLUMN publish_timestamp;
  `);
}
