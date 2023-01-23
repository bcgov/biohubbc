import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  drop procedure if exists api_delete_occurrence_submission;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  `);
}
