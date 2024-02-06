import { Knex } from 'knex';

/**
 * Adds itis_scientific_name and itis_tsn id to survery_observations table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql 
    SET search_path = 'biohub';

    ALTER TABLE survey_observation ADD COLUMN itis_tsn INTEGER;
    ALTER TABLE survey_observation ADD COLUMN itis_scientific_name VARCHAR(300);

    COMMENT ON COLUMN survey_observation.wldtaxonomic_units_id IS '(Deprecated) 'The species associated with the observation.';
    COMMENT ON COLUMN survey_observation.itis_tsn IS 'The ITIS TSN identifier for the species associated with the observation.';
    COMMENT ON COLUMN survey_observation.itis_scientific_name IS 'The scientific name for the species associated with the observation.';

    ----------------------------------------------------------------------------------------
    -- Create new views
    ----------------------------------------------------------------------------------------
  
    set search_path=biohub_dapi_v1;
  
    create or replace view survey_observation as select * from biohub.survey_observation;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
