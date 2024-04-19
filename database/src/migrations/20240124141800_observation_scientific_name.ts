import { Knex } from 'knex';

const taxon_lookup = [
  { wldtaxonomic_units_id: 2012, tsn: 180599, scientificName: 'Canis latrans' },
  { wldtaxonomic_units_id: 2013, tsn: 180596, scientificName: 'Canis lupus' },
  { wldtaxonomic_units_id: 828, tsn: 175693, scientificName: 'Galliformes' },
  { wldtaxonomic_units_id: 2019, tsn: 180551, scientificName: 'Gulo gulo' },
  { wldtaxonomic_units_id: 1594, tsn: 175841, scientificName: 'Tympanuchus phasianellus' },
  { wldtaxonomic_units_id: 1718, tsn: 177929, scientificName: 'Strix nebulosa' },
  { wldtaxonomic_units_id: 2037, tsn: 180543, scientificName: 'Ursus arctos' },
  { wldtaxonomic_units_id: 2062, tsn: 180713, scientificName: 'Oreamnos americanus' },
  { wldtaxonomic_units_id: 2068, tsn: 180698, scientificName: 'Odocoileus hemionus' },
  { wldtaxonomic_units_id: 2065, tsn: 898198, scientificName: 'Alces americanus' },
  { wldtaxonomic_units_id: 2070, tsn: 180701, scientificName: 'Rangifer tarandus' },
  { wldtaxonomic_units_id: 2069, tsn: 180699, scientificName: 'Odocoileus virginianus' },
  { wldtaxonomic_units_id: 23918, tsn: 898933, scientificName: 'Bison bison athabascae' },
  { wldtaxonomic_units_id: 23922, tsn: 898808, scientificName: 'Ovis dalli stonei' },
  { wldtaxonomic_units_id: 23920, tsn: 180711, scientificName: 'Ovis canadensis' },
  { wldtaxonomic_units_id: 35369, tsn: 1086061, scientificName: 'Pekania pennanti' },
  { wldtaxonomic_units_id: 35370, tsn: 180695, scientificName: 'Cervus elaphus' },
  { wldtaxonomic_units_id: 28516, tsn: 180691, scientificName: 'Equus caballus' }
];

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
    ----------------------------------------------------------------------------------------
    -- Add new columns (without not null constraint), deprecate old column
    ----------------------------------------------------------------------------------------
    SET search_path = 'biohub';

    -- study_species
    ALTER TABLE study_species ADD COLUMN itis_tsn INTEGER;
    COMMENT ON COLUMN study_species.itis_tsn IS 'The ITIS TSN identifier for the species associated with the survey.';

    ALTER TABLE study_species ALTER COLUMN wldtaxonomic_units_id DROP NOT NULL;
    COMMENT ON COLUMN study_species.wldtaxonomic_units_id IS '(Deprecated) System generated UID for a taxon.';

    -- survey_observation
    ALTER TABLE survey_observation ADD COLUMN itis_tsn INTEGER;
    COMMENT ON COLUMN survey_observation.itis_tsn IS 'The ITIS TSN identifier for the species associated with the observation.';

    ALTER TABLE survey_observation ADD COLUMN itis_scientific_name VARCHAR(300);
    COMMENT ON COLUMN survey_observation.itis_scientific_name IS 'The scientific name for the species associated with the observation.';

    COMMENT ON COLUMN survey_observation.wldtaxonomic_units_id IS '(Deprecated) The species associated with the observation.';

    ----------------------------------------------------------------------------------------
    -- Create indexes
    ----------------------------------------------------------------------------------------
    CREATE INDEX study_species_idx1 ON study_species(itis_tsn);

    CREATE INDEX survey_observation_idx5 ON survey_observation(itis_tsn);
    CREATE INDEX survey_observation_idx6 ON survey_observation(itis_scientific_name);
  `);

  // Map all known species used in prod from their elsaticsearch taxonomic ID to their ITIS TSN.
  const studySpeciesQueries = taxon_lookup.map((entry) => {
    return knex.raw(`--sql
      SET
        search_path = 'biohub';
      UPDATE
        study_species
      SET
        itis_tsn = ${entry.tsn}
      WHERE
        wldtaxonomic_units_id = ${entry.wldtaxonomic_units_id};
    `);
  });

  const observationsQueries = taxon_lookup.map((entry) => {
    return knex.raw(`--sql
      SET
        search_path = 'biohub';
      UPDATE
        survey_observation
      SET
        itis_tsn = ${entry.tsn},
        itis_scientific_name = '${entry.scientificName}'
      WHERE
        wldtaxonomic_units_id = ${entry.wldtaxonomic_units_id};
    `);
  });

  await Promise.all([...studySpeciesQueries, ...observationsQueries]);

  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Add not null constraint after patching column values
    ----------------------------------------------------------------------------------------
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
