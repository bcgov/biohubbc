import { Knex } from 'knex';

/**
 * Drop deprecated study_species.wldtaxonomic_units_id column.
 * Drop deprecated survey_observation.wldtaxonomic_units_id column.
 * Drop deprecated survey.field_method_id column.
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

    DROP VIEW IF EXISTS study_species;
    DROP VIEW IF EXISTS survey_observation;

    DROP VIEW IF EXISTS survey;

    ----------------------------------------------------------------------------------------
    -- Alter tables/data
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    -- Drop deprecated wldtaxonomic_units_id column
    ALTER TABLE study_species DROP COLUMN IF EXISTS wldtaxonomic_units_id;
    ALTER TABLE survey_observation DROP COLUMN IF EXISTS wldtaxonomic_units_id;

    -- Drop deprecated field_method_id column
    ALTER TABLE survey DROP COLUMN IF EXISTS field_method_id;

    ----------------------------------------------------------------------------------------
    -- Update views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW study_species as SELECT * FROM biohub.study_species;
    CREATE OR REPLACE VIEW survey_observation as SELECT * FROM biohub.survey_observation;

    CREATE OR REPLACE VIEW survey as SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
