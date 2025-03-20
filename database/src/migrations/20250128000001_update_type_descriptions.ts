import { Knex } from 'knex';

/**
 * Add/Update descriptions for autocomplete options in the type and site_strategy tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

SET search_path=biohub;

----------------------------------------------------------------------------------------
-- Add new type descriptions to the type table  
----------------------------------------------------------------------------------------

UPDATE type
    SET description = CASE name
      WHEN 'Telemetry' THEN 'Tracking animal movements using radio, GPS, or other remote sensing technologies.'
      WHEN 'Species observations' THEN 'Recording the presence, behavior, or abundance of animals in the survey area.'
      WHEN 'Animal captures' THEN 'Physically capturing animals for tagging, measurement, or sample collection.'
      WHEN 'Animal mortalities' THEN 'Documenting dead animals, including cause of death when possible.'
      WHEN 'Habitat features' THEN 'Recording characteristics of the environment, such as vegetation, water sources, or terrain.'
    END
    WHERE name IN ('Telemetry', 'Species observations', 'Animal captures', 'Animal mortalities', 'Habitat features');


----------------------------------------------------------------------------------------
-- Add new site_selection_strategy descriptions to the site_strategy table  
----------------------------------------------------------------------------------------
UPDATE site_strategy
    SET description = CASE name
      WHEN 'Random' THEN 'Randomly selecting sites for surveying.'
      WHEN 'Stratified' THEN 'Dividing the survey area into distinct sub-areas and sampling each sub-area separately.'
      WHEN 'Systematic' THEN 'Selecting sites at regular intervals across the survey area.'
    END
    WHERE name IN ('Random', 'Stratified', 'Systematic');

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
