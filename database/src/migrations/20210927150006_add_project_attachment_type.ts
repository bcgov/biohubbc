import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.project_attachment add column file_type varchar(300);

    set search_path = biohub_dapi_v1;

    set role biohub_api;

    create or replace view project_attachment as select * from ${DB_SCHEMA}.project_attachment;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;

    SET ROLE biohub_api;

    create or replace view project_attachment as select * from ${DB_SCHEMA}.project_attachment;

    SET ROLE postgres;

    ALTER TABLE ${DB_SCHEMA}.project_attachment remove column file_type;
  `);
}
