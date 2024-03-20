import { Knex } from 'knex';

/**
 * Adds itis_scientific_name and itis_tsn id to `survery_observation` and
 * `study_species` tables.
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
    COMMENT ON COLUMN survey_observation.wldtaxonomic_units_id IS '(Deprecated) The species associated with the observation.';
    COMMENT ON COLUMN survey_observation.itis_tsn IS 'The ITIS TSN identifier for the species associated with the observation.';
    COMMENT ON COLUMN survey_observation.itis_scientific_name IS 'The scientific name for the species associated with the observation.';

    ALTER TABLE study_species ADD COLUMN itis_tsn INTEGER;
    ALTER TABLE study_species ALTER COLUMN wldtaxonomic_units_id DROP NOT NULL;
    COMMENT ON COLUMN study_species.wldtaxonomic_units_id IS '(Deprecated) System generated UID for a taxon.';
    COMMENT ON COLUMN study_species.itis_tsn IS 'The ITIS TSN identifier for the species associated with the survey.';

    -- TODO Currently, we are using a placeholder ITIS species. Instead, we should map all known species used in prod from their elsaticsearch taxonomic ID to their ITIS TSN.

    -- Placeholder:
    UPDATE study_species SET itis_tsn = 202384;

    -- Add not null constraint
    ALTER TABLE survey_observation ALTER COLUMN itis_tsn SET NOT NULL;

    ALTER TABLE study_species ALTER COLUMN itis_tsn SET NOT NULL;

    ----------------------------------------------------------------------------------------
    -- Create new views
    ----------------------------------------------------------------------------------------

    set search_path=biohub_dapi_v1;

    create or replace view survey_observation as select * from biohub.survey_observation;
    create or replace view study_species as select * from biohub.study_species;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
