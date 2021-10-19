import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public;

    ALTER TABLE ${DB_SCHEMA}.occurrence ADD COLUMN sex VARCHAR(3000);
    COMMENT ON COLUMN ${DB_SCHEMA}.occurrence.sex IS 'A string representation of the value provided for the given Darwin Core term.';

    SET SEARCH_PATH = biohub_dapi_v1,public;
    SET ROLE biohub_api;

    CREATE OR REPLACE VIEW occurrence AS SELECT * FROM ${DB_SCHEMA}.occurrence;

    SET ROLE postgres;
    SET SEARCH_PATH = ${DB_SCHEMA},public;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
