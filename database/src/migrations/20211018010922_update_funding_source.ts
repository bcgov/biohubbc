import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public;

    UPDATE funding_source SET project_id_optional = 'Y' WHERE name = 'Together for Wildlife';
    UPDATE funding_source SET project_id_optional = 'Y' WHERE name = 'Land Based Investment Strategy';
    UPDATE funding_source SET project_id_optional = 'Y' WHERE name = 'Caribou Recovery Program';

    SET SEARCH_PATH = biohub_dapi_v1,public;
    SET ROLE biohub_api;

    CREATE OR REPLACE VIEW funding_source AS SELECT * FROM ${DB_SCHEMA}.funding_source;

    SET ROLE postgres;
    SET SEARCH_PATH = ${DB_SCHEMA},public;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
