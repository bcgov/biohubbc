import { Knex } from 'knex';

/**
 * Drop survey vantage code
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql  
    ----------------------------------------------------------------------------------------
    -- Drop views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW IF EXISTS survey;
    DROP VIEW IF EXISTS vantage;

    ----------------------------------------------------------------------------------------
    -- Alter tables/data
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    DROP TABLE survey_vantage;
    DROP TABLE vantage;

    ----------------------------------------------------------------------------------------
    -- Update views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
