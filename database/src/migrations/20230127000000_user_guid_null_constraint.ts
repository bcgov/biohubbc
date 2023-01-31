import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Removes the NULL constraint on user_guid from the system_user table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET search_path = ${DB_SCHEMA_DAPI_V1};

    DROP VIEW system_user;

    SET search_path = ${DB_SCHEMA};

    ALTER TABLE system_user ALTER COLUMN user_guid DROP NOT NULL;

    UPDATE system_user set user_guid = null where user_guid = 'default_guid';
    
    CREATE UNIQUE INDEX system_user_uk1 ON system_user (user_guid);

    SET search_path = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW system_user AS SELECT * FROM ${DB_SCHEMA}.system_user;
  `);
}

/**
 * Not implemented.
 * @param knex
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
