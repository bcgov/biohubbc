import { Knex } from 'knex';

/**
 * Update survey_habitat_feature table:
 * - Update latitude, longitude, observed_date, observed_time columns
 *   - Allow null values
 * - Add survey_sample_period_id column
 * - Add check constraints
 *   - Check that observed_date is not null or survey_sample_period_id is not null
 *   - Check that latitude and longitude are not null or survey_sample_period_id is not null
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Update survey_habitat_feature table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub,public;

    ALTER TABLE survey_habitat_feature
      ALTER COLUMN latitude DROP NOT NULL,
      ALTER COLUMN longitude DROP NOT NULL,
      ALTER COLUMN observed_date DROP NOT NULL,
      ALTER COLUMN observed_time DROP NOT NULL;

    ----------------------------------------------------------------------------------------

    ALTER TABLE survey_habitat_feature
      ADD COLUMN survey_sample_period_id integer;
  
    COMMENT ON COLUMN survey_habitat_feature.survey_sample_period_id IS 'Foreign key referencing the survey_sample_period table.';

    -- Add foreign key constraint
    ALTER TABLE survey_habitat_feature
      ADD CONSTRAINT survey_habitat_feature_fk3
      FOREIGN KEY (survey_sample_period_id)
      REFERENCES survey_sample_period(survey_sample_period_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_habitat_feature_idx3 ON survey_habitat_feature(survey_sample_period_id);

    ----------------------------------------------------------------------------------------

    ALTER TABLE survey_habitat_feature
      ADD CONSTRAINT survey_habitat_feature_date_check
        CHECK (observed_date IS NOT NULL OR survey_sample_period_id IS NOT NULL),
      ADD CONSTRAINT survey_habitat_feature_location_check
        CHECK ((latitude IS NOT NULL AND longitude IS NOT NULL) OR survey_sample_period_id IS NOT NULL);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
