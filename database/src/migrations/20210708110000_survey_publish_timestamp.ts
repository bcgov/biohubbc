import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Add the publish_timestamp column to the survey table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
    ALTER TABLE survey ADD COLUMN publish_timestamp timestamptz(6);

    set search_path = biohub_dapi_v1;
    set role biohub_api;
    create or replace view survey as select * from biohub.survey;
    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public,biohub_dapi_v1;

    SET ROLE biohub_api;

    DROP VIEW IF EXISTS biohub_dapi_v1.survey;

    SET ROLE postgres;

    ALTER TABLE survey DROP COLUMN publish_timestamp;
  `);
}
