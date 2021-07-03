import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- drop the views
  set search_path = biohub_dapi_v1;
  set role biohub_api;
  drop view if exists security;
  drop view if exists security_rule;
  drop view if exists webform_draft;
  drop view if exists occurrence;

  set role postgres;
  set search_path = ${DB_SCHEMA},public;

  DROP TABLE if exists security;
  DROP TABLE if exists security_rule;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  `);

}
