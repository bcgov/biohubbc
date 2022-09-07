import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add multiple columns to support new summary templates.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';

    -- Adding multiple columns to support new summary templates.

    SET SEARCH_PATH = ${DB_SCHEMA};
 
    ALTER TABLE survey_summary_detail ADD COLUMN population_unit varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN block_sample_unit_id varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN observed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN estimated integer;
    ALTER TABLE survey_summary_detail ADD COLUMN total_area_survey_sqm integer;
    ALTER TABLE survey_summary_detail ADD COLUMN area_flown integer;
    ALTER TABLE survey_summary_detail ADD COLUMN total_kilometers_surveyed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN best_parameter_flag varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN total_marked_animals_observed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN marked_animals_available integer;
    ALTER TABLE survey_summary_detail ADD COLUMN parameter_comments varchar(500);

    COMMENT ON COLUMN survey_summary_detail.population_unit IS 'Name of species population unit/herd unit.';
    COMMENT ON COLUMN survey_summary_detail.block_sample_unit_id IS 'Value which identify the block/sampling unit; e.g. 1, 2, 3…; or 1_1, 1_2, 2_1...';
    COMMENT ON COLUMN survey_summary_detail.observed IS 'The observed numerical value of the Parameter, e.g. 150 individuals observed.';
    COMMENT ON COLUMN survey_summary_detail.estimated IS 'The estimated numerical value of the Parameter, e.g. 250 individuals estimated.';
    COMMENT ON COLUMN survey_summary_detail.total_area_survey_sqm IS 'Area of study.';
    COMMENT ON COLUMN survey_summary_detail.area_flown IS 'Flown area.';
    COMMENT ON COLUMN survey_summary_detail.total_kilometers_surveyed IS 'Total linear km surveyed.';
    COMMENT ON COLUMN survey_summary_detail.best_parameter_flag IS 'Indicates which value is most reliable.';
    COMMENT ON COLUMN survey_summary_detail.total_marked_animals_observed IS 'Number of marked animals observed during survey.';
    COMMENT ON COLUMN survey_summary_detail.marked_animals_available IS 'Number of marked animals available in study area.';
    COMMENT ON COLUMN survey_summary_detail.parameter_comments IS 'General comments about the parameter measured.';

    -- Update Survey Summary Detail View
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    CREATE OR REPLACE VIEW survey_summary_detail AS SELECT * FROM ${DB_SCHEMA}.survey_summary_detail;
  `);
}

/**
 * Drop all new columns for new summary templates.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA};

    -- Drop new columns

    ALTER TABLE survey_summary_detail DROP COLUMN population_unit;
    ALTER TABLE survey_summary_detail DROP COLUMN block_sample_unit_id;
    ALTER TABLE survey_summary_detail DROP COLUMN observed;
    ALTER TABLE survey_summary_detail DROP COLUMN estimated;
    ALTER TABLE survey_summary_detail DROP COLUMN total_area_survey_sqm;
    ALTER TABLE survey_summary_detail DROP COLUMN area_flown;
    ALTER TABLE survey_summary_detail DROP COLUMN total_kilometers_surveyed;
    ALTER TABLE survey_summary_detail DROP COLUMN best_parameter_flag;
    ALTER TABLE survey_summary_detail DROP COLUMN total_marked_animals_observed;
    ALTER TABLE survey_summary_detail DROP COLUMN marked_animals_available;
    ALTER TABLE survey_summary_detail DROP COLUMN parameter_comments;

    -- Update Survey Summary Detail View
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    CREATE OR REPLACE VIEW survey_summary_detail AS SELECT * FROM ${DB_SCHEMA}.survey_summary_detail;
  `);
}
