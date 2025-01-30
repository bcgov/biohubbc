import { Knex } from 'knex';

/**
 * Add new columns to survey_sample_period table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
----------------------------------------------------------------------------------------
-- Add new type descriptions to the type table  
----------------------------------------------------------------------------------------

SET search_path=biohub;

UPDATE type
    SET description = CASE name
      WHEN 'Telemetry' THEN 'Tracking animal movements using radio, GPS, or other remote sensing technologies.'
      WHEN 'Species observations' THEN 'Recording the presence, behavior, or abundance of animals in the survey area.'
      WHEN 'Animal captures' THEN 'Physically capturing animals for tagging, measurement, or sample collection.'
      WHEN 'Animal mortalities' THEN 'Documenting dead animals, including cause of death when possible.'
      WHEN 'Habitat features' THEN 'Recording characteristics of the environment, such as vegetation, water sources, or terrain.'
    END
    WHERE name IN ('Telemetry', 'Species observations', 'Animal captures', 'Animal mortalities', 'Habitat features');

`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }
