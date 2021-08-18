import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.project add column geojson jsonb;
    ALTER TABLE ${DB_SCHEMA}.survey add column geojson jsonb;

    set search_path = biohub_dapi_v1;

    set role biohub_api;

    create or replace view project as select * from ${DB_SCHEMA}.project;
    create or replace view survey as select * from ${DB_SCHEMA}.survey;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;

    SET ROLE biohub_api;

    DROP VIEW IF EXISTS biohub_dapi_v1.project;
    DROP VIEW IF EXISTS biohub_dapi_v1.survey;

    SET ROLE postgres;

    ALTER TABLE ${DB_SCHEMA}.project remove column geojson;
    ALTER TABLE ${DB_SCHEMA}.survey remove column geojson;
  `);
}
