import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA};
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA IF EXISTS ${DB_SCHEMA};
  `);
}
