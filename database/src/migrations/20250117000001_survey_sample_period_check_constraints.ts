import { Knex } from 'knex';

/**
 * Table: survey_sample_period
 *
 * Add new check constraints to ensure the minimum data requirements for the survey_sample_period table are met.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    -- Asserts that start_date and end_date are either both null or both not null
    ALTER TABLE survey_sample_period ADD CONSTRAINT check_start_and_end_date_requirement CHECK (
      NUM_NONNULLS(start_date, end_date) IN (0, 2)
    );

    COMMENT ON CONSTRAINT check_start_and_end_date_requirement ON survey_sample_period IS 'Checks that start_date and end_date are either both null or both not null.';

    /*
     * Asserts that the survey_sample_period record meets the minimum data requirements for the survey_sample_period
     * table. Specifically, checks that at least one of the following items is not null:
     * - survey_sample_site_id
     * - method_technique_id
     * - start_date, end_date (either both null or both not null)
     */
    ALTER TABLE survey_sample_period ADD CONSTRAINT check_minimum_data_requirement CHECK (
      NUM_NONNULLS(survey_sample_site_id, method_technique_id, start_date) >= 1
    );

    COMMENT ON CONSTRAINT check_minimum_data_requirement ON survey_sample_period IS 'Checks that at least one of the following items is not null: survey_sample_site_id, method_technique_id, start_date + end_date. Note: This constraint only checks start_date because the check_start_and_end_date_requirement constraint already ensures that start_date and end_date are either both null or both not null.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
