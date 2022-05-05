import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add `survey.surveyed_all_areas` column and update `survey` view.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';

    -- Add 'survey.surveyed_all_areas' column

    SET SEARCH_PATH = ${DB_SCHEMA};

    ALTER TABLE survey ADD COLUMN surveyed_all_areas boolean;

    COMMENT ON COLUMN survey.surveyed_all_areas IS 'Defines whether or not this survey covered all areas that include the population of interest. A true value indicates all areas were surveyed, a false value indicates only some areas were surveyed.';

    -- Update 'survey' view

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW survey AS SELECT * FROM ${DB_SCHEMA}.survey;
  `);
}

/**
 * Drop `survey.surveyed_all_areas` column and update `survey` view.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';

    -- Drop 'survey' view

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    DROP VIEW survey;

    -- Drop 'survey.surveyed_all_areas' column

    SET SEARCH_PATH = ${DB_SCHEMA};

    ALTER TABLE survey DROP COLUMN surveyed_all_areas;

    -- Create 'survey' view

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW survey AS SELECT * FROM ${DB_SCHEMA}.survey;
  `);
}
