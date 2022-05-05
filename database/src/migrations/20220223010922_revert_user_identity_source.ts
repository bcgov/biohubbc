import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA},public;

    UPDATE user_identity_source SET name = 'BCEID' WHERE name = 'BCEID-BASIC-AND-BUSINESS';

    SET SEARCH_PATH = biohub_dapi_v1,public;
    SET ROLE biohub_api;

    CREATE OR REPLACE VIEW user_identity_source AS SELECT * FROM ${DB_SCHEMA}.user_identity_source;

    SET ROLE postgres;
    SET SEARCH_PATH = ${DB_SCHEMA},public;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
