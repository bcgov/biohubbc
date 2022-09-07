import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

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
 
    ALTER TABLE survey_summary_detail ADD COLUMN population_unit varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN block_sample_unit_id varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN observed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN estimated integer;
    ALTER TABLE survey_summary_detail ADD COLUMN sightability_correction_factor integer;
    ALTER TABLE survey_summary_detail ADD COLUMN total_area_survey_sqm integer;
    ALTER TABLE survey_summary_detail ADD COLUMN area_flown integer;
    ALTER TABLE survey_summary_detail ADD COLUMN total_kilometers_surveyed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN best_parameter_flag varchar(50);
    ALTER TABLE survey_summary_detail ADD COLUMN total_marked_animals_observed integer;
    ALTER TABLE survey_summary_detail ADD COLUMN marked_animals_available integer;
    ALTER TABLE survey_summary_detail ADD COLUMN parameter_comments varchar(500);

    -- COMMENT ON COLUMN survey.surveyed_all_areas IS 'Defines whether or not this survey covered all areas that include the population of interest. A true value indicates all areas were surveyed, a false value indicates only some areas were surveyed.';
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
    SET SEARCH_PATH = ${DB_SCHEMA};

    -- Drop 'survey.surveyed_all_areas' column

    ALTER TABLE survey_summary_detail DROP COLUMN population_unit;
    ALTER TABLE survey_summary_detail DROP COLUMN block_sample_unit_id;
    ALTER TABLE survey_summary_detail DROP COLUMN observed;
    ALTER TABLE survey_summary_detail DROP COLUMN estimated;
    ALTER TABLE survey_summary_detail DROP COLUMN sightability_correction_factor;
    ALTER TABLE survey_summary_detail DROP COLUMN total_area_survey_sqm;
    ALTER TABLE survey_summary_detail DROP COLUMN area_flown;
    ALTER TABLE survey_summary_detail DROP COLUMN total_kilometers_surveyed;
    ALTER TABLE survey_summary_detail DROP COLUMN best_parameter_flag;
    ALTER TABLE survey_summary_detail DROP COLUMN total_marked_animals_observed;
    ALTER TABLE survey_summary_detail DROP COLUMN marked_animals_available;
    ALTER TABLE survey_summary_detail DROP COLUMN parameter_comments;

  `);
}
