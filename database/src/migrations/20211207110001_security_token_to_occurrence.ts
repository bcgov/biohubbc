import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  ALTER TABLE ${DB_SCHEMA}.occurrence ADD COLUMN security_token UUID;
  COMMENT ON COLUMN occurrence.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
  ;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  ALTER TABLE ${DB_SCHEMA}.occurrence DROP COLUMN security_token UUID;

  `);
}
