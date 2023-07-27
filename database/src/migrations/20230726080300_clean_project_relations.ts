import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Remove caveats and climate relations
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -------------------------------------------------------------------------
    -- Remove old views
    -------------------------------------------------------------------------
    SET search_path = ${DB_SCHEMA_DAPI_V1};
    DROP VIEW project;
    DROP VIEW climate_change_initiative;
    DROP VIEW project_climate_initiative;
    DROP VIEW survey;

    -------------------------------------------------------------------------
    -- Remove Climate initiative tables
    -------------------------------------------------------------------------
    SET search_path = ${DB_SCHEMA};
    DROP TABLE project_climate_initiative;
    DROP TABLE climate_change_initiative;
    

    -------------------------------------------------------------------------
    -- Add comments column to survey
    -------------------------------------------------------------------------
    ALTER TABLE survey ADD COLUMN 
    -------------------------------------------------------------------------
    -- Remove caveats table
    -------------------------------------------------------------------------
    ALTER TABLE project DROP COLUMN caveats;

    SET search_path = ${DB_SCHEMA_DAPI_V1};
    CREATE OR REPLACE VIEW project as select * from ${DB_SCHEMA}.project;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
