import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  alter table ${DB_SCHEMA}.security_rule add column su_id integer;
  alter table ${DB_SCHEMA}.security alter column su_id DROP NOT NULL;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  alter table ${DB_SCHEMA}.security_rule drop column if exists su_id;
  alter table ${DB_SCHEMA}.security alter column su_id SET NULL;

  `);
}
