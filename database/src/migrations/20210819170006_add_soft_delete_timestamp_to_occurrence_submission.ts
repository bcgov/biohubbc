import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.occurrence_submission add column soft_delete_timestamp timestamptz(6);

    set search_path = biohub_dapi_v1;

    set role biohub_api;

    create or replace view occurrence_submission as select * from ${DB_SCHEMA}.occurrence_submission;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;

    SET ROLE biohub_api;

    create or replace view occurrence_submission as select * from ${DB_SCHEMA}.occurrence_submission;

    SET ROLE postgres;

    ALTER TABLE ${DB_SCHEMA}.occurrence_submission remove column soft_delete_timestamp;
  `);
}
