import { Knex } from 'knex';

/**
 * Adds capture_id references to the deployment table to track the start and end of deployments
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    
    -- Set the search path
    SET SEARCH_PATH = biohub, biohub_dapi_v1;

    -- Drop the view if it exists
    DROP VIEW IF EXISTS biohub_dapi_v1.deployment;

    -- Add columns to the deployment table
    ALTER TABLE biohub.deployment ADD COLUMN critterbase_start_capture_id UUID;
    ALTER TABLE biohub.deployment ADD COLUMN critterbase_end_capture_id UUID;
    ALTER TABLE biohub.deployment ADD COLUMN critterbase_end_mortality_id UUID;

    -- Recreate the view
    CREATE OR REPLACE VIEW biohub_dapi_v1.deployment AS
    SELECT * FROM biohub.deployment;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
