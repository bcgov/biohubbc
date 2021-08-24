import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.submission_message add column message_grouping varchar(300);

    set search_path = biohub_dapi_v1;

    set role biohub_api;

    create or replace view submission_message as select * from ${DB_SCHEMA}.submission_message;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  `);
}
