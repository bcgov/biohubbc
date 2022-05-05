import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  ALTER TABLE security_rule ADD COLUMN user_groups json;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  ALTER TABLE security_rule DROP COLUMN user_groups;

  `);
}
