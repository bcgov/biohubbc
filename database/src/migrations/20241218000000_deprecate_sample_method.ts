import { Knex } from 'knex';

/**
 * Goal:
 *
 * Drop the survey_sample_method table.
 *
 * Changes:
 *
 * method_technique
 * - Add new column method_response_metric_id to method_technique table
 *
 * survey_sample_period
 * - Add new column method_technique_id to survey_sample_period table
 * - Add new column survey_sample_site_id to survey_sample_period table
 *
 * survey_observation
 *
 *   survey_sample_site_id
 *   - Drop foreign key constraints for survey_sample_site_id
 *   - Drop index for foreign key
 *   - Update comment for column survey_sample_site_id: indicate that it is deprecated
 *
 *   survey_sample_site_id
 *   - Drop foreign key constraints for survey_sample_method_id
 *   - Drop index for foreign key
 *   - Update comment for column survey_sample_method_id: indicate that it is deprecated
 *
 * survey_sample_method
 * - Migrate existing data from survey_sample_method to method_technique and survey_sample_period tables.
 * - Drop survey_sample_method table
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Drop views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW IF EXISTS method_technique;
    DROP VIEW IF EXISTS survey_sample_site;
    DROP VIEW IF EXISTS survey_sample_method;
    DROP VIEW IF EXISTS survey_sample_period;
    DROP VIEW IF EXISTS survey_observation;

    ----------------------------------------------------------------------------------------
    -- Alter method_technique table
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    -- Add new foreign key column to method_response_metric table
    ALTER TABLE method_technique ADD COLUMN method_response_metric_id INTEGER;

    COMMENT ON COLUMN method_technique.method_response_metric_id IS 'Foreign key referencing the method_response_metric table.';

    -- Add foreign key constraint
    ALTER TABLE method_technique ADD CONSTRAINT method_response_metric_fk1 FOREIGN KEY (method_response_metric_id) REFERENCES method_response_metric(method_response_metric_id);

    -- Add indexes for foreign keys
    CREATE INDEX method_technique_idx3 ON method_technique(method_response_metric_id);

    ----------------------------------------------------------------------------------------
    -- Alter survey_sample_period table
    ----------------------------------------------------------------------------------------

    -- Drop deprecated foreign key constraint to survey_sample_method table.
    ALTER TABLE survey_sample_period DROP CONSTRAINT survey_sample_period_fk1;

    ----------------------------------------------------------------------------------------

    -- Add new foreign key column to method_technique table
    ALTER TABLE survey_sample_period ADD COLUMN method_technique_id INTEGER;

    COMMENT ON COLUMN survey_sample_period.method_technique_id IS 'Foreign key referencing the method_technique table.';

    -- Add foreign key constraint
    ALTER TABLE survey_sample_period ADD CONSTRAINT survey_sample_period_fk1 FOREIGN KEY (method_technique_id) REFERENCES method_technique(method_technique_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_sample_period_idx1 ON survey_sample_period(method_technique_id);

    ----------------------------------------------------------------------------------------

    -- Add new foreign key column to survey_sample_site table
    ALTER TABLE survey_sample_period ADD COLUMN survey_sample_site_id INTEGER;

    COMMENT ON COLUMN survey_sample_period.survey_sample_site_id IS 'Foreign key referencing the survey_sample_site table.';

    -- Add foreign key constraint
    ALTER TABLE survey_sample_period ADD CONSTRAINT survey_sample_period_fk2 FOREIGN KEY (survey_sample_site_id) REFERENCES survey_sample_site(survey_sample_site_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_sample_period_idx2 ON survey_sample_period(survey_sample_site_id);

    ----------------------------------------------------------------------------------------
    -- Migrate existing data
    ----------------------------------------------------------------------------------------

    -- Migrate the method_response_metric_id from the deprecated survey_sample_method table to the method_technique table
    -- Migrate the description from the deprecated survey_sample_method table to the method_technique table, appending the survey_sample_method description if the method_technique description is non-null.
    UPDATE method_technique
    SET method_response_metric_id = survey_sample_method.method_response_metric_id,
        description = 
            CASE 
                WHEN 
                    method_technique.description IS NOT NULL AND method_technique.description != '' 
                THEN 
                    method_technique.description || ' ' || survey_sample_method.description
                ELSE 
                    survey_sample_method.description
            END
    FROM survey_sample_method
    WHERE method_technique.method_technique_id = survey_sample_method.method_technique_id;

    -- Migrate method_technique_id from the deprecated survey_sample_method table to the survey_sample_period table
    -- Migrate survey_sample_site_id from the deprecated survey_sample_method table to the survey_sample_period table
    UPDATE survey_sample_period
    SET method_technique_id = survey_sample_method.method_technique_id,
        survey_sample_site_id = survey_sample_method.survey_sample_site_id
    FROM survey_sample_method
    WHERE survey_sample_period.survey_sample_method_id = survey_sample_method.survey_sample_method_id;

    ----------------------------------------------------------------------------------------
    -- Alter method_technique_table
    ----------------------------------------------------------------------------------------

    -- Now that we have migrated the data, we can set the columns to NOT NULL
    ALTER TABLE method_technique ALTER COLUMN method_response_metric_id SET NOT NULL;

    ----------------------------------------------------------------------------------------
    -- Alter survey_sample_period table
    ----------------------------------------------------------------------------------------

    -- Drop deprecated survey_sample_method_id column
    ALTER TABLE survey_sample_period DROP COLUMN survey_sample_method_id;

    -- Now that we have migrated the data, we can set the columns to NOT NULL
    ALTER TABLE survey_sample_period ALTER COLUMN survey_sample_site_id SET NOT NULL;
    ALTER TABLE survey_sample_period ALTER COLUMN method_technique_id SET NOT NULL;

    ----------------------------------------------------------------------------------------
    -- Alter survey_observation table
    ----------------------------------------------------------------------------------------

    -- Drop deprecated foreign key constraint to survey_sample_site table.
    ALTER TABLE survey_observation DROP CONSTRAINT IF EXISTS survey_observation_fk2;
    -- Drop index for foreign key
    DROP INDEX IF EXISTS survey_observation_idx2;
    -- Add comment to indicate that the column is deprecated
    COMMENT ON COLUMN survey_observation.survey_sample_site_id IS '(Deprecated) Use survey_sample_period_id instead.';

    -- Drop deprecated foreign key constraint to survey_sample_method table.
    ALTER TABLE survey_observation DROP CONSTRAINT IF EXISTS survey_observation_fk3;
    -- Drop index for foreign key
    DROP INDEX IF EXISTS survey_observation_idx3;
    -- Add comment to indicate that the column is deprecated
    COMMENT ON COLUMN survey_observation.survey_sample_method_id IS '(Deprecated) Use survey_sample_period_id instead.';

    ----------------------------------------------------------------------------------------
    -- Drop survey_sample_method table
    ----------------------------------------------------------------------------------------

    DROP TABLE IF EXISTS survey_sample_method CASCADE;

    ----------------------------------------------------------------------------------------
    -- Update views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW method_technique AS SELECT * FROM biohub.method_technique;
    CREATE OR REPLACE VIEW survey_sample_site AS SELECT * FROM biohub.survey_sample_site;
    CREATE OR REPLACE VIEW survey_sample_period AS SELECT * FROM biohub.survey_sample_period;
    CREATE OR REPLACE VIEW survey_observation AS SELECT * FROM biohub.survey_observation;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
