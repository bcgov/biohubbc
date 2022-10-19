import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

enum INTENDED_OUTCOME {
  HABITAT_ASSESSMENT = '1',
  RECONNAISSANCE = '2',
  RECRUITMENT = '3',
  POPULATION_COMPOSITION = '4',
  COMMUNITY_COMPOSITION = '5',
  POPULATION_COUNT = '6',
  POPULATION_COUNT_RECRUITMENT = '7',
  POPULATION_COUNT_COMPOSITION = '8',
  POPULATION_INDEX = '9',
  MORTALITY = '10',
  SURVIVAL = '11',
  SPECIMEN_COLLECTION = '12',
  TRANSLOCATION = '13',
  DISTRIBUTION_RANGE_MAP = '14'
}

enum WILD_TAXON_IDS {
  MOOSE = '4146', //M_ALAM
  GOAT = '4164', //M-ORAM
  SHEEP = '8618', //M-OVDA
  ELK = '4148', //M-CECA
  DEER = '4149' //M-ODHE
}

/**
 * Populate template validations.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
  `);

  updateTemplateIds(knex, 3, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.MOOSE); //Moose Recruitment Survey
  updateTemplateIds(knex, 2, null, WILD_TAXON_IDS.MOOSE); //Moose SRB or Composition Survey
  updateTemplateIds(knex, 1, null, WILD_TAXON_IDS.MOOSE); //Moose SRB or Composition Survey

  updateTemplateIds(knex, 4, null, WILD_TAXON_IDS.GOAT); //Goat Composition or Recruitment Survey
  updateTemplateIds(knex, 5, null, WILD_TAXON_IDS.GOAT); //Goat Composition or Recruitment Survey

  updateTemplateIds(knex, 6, null, WILD_TAXON_IDS.SHEEP); //Sheep Composition or Recruitment Survey
  updateTemplateIds(knex, 7, null, WILD_TAXON_IDS.SHEEP); //Sheep Composition or Recruitment Survey

  updateTemplateIds(knex, 8, null, WILD_TAXON_IDS.MOOSE); //Moose Composition Survey
  updateTemplateIds(knex, 9, null, WILD_TAXON_IDS.MOOSE); //Moose SRB Survey

  updateTemplateIds(knex, 10, null, WILD_TAXON_IDS.MOOSE); //Moose Transect Distance Survey

  updateTemplateIds(knex, 11, INTENDED_OUTCOME.POPULATION_COUNT_RECRUITMENT, WILD_TAXON_IDS.SHEEP); //Sheep Population Total Count Recruitment Composition Survey
  updateTemplateIds(knex, 12, INTENDED_OUTCOME.POPULATION_COUNT_RECRUITMENT, WILD_TAXON_IDS.GOAT); //Goat Population Total Count Recruitment Composition Survey

  updateTemplateIds(knex, 13, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.ELK); //Elk Aerial Transect Distance Sampling Recruitment Composition Survey
  updateTemplateIds(knex, 14, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.ELK); //Elk Aerial SRB Recruit Composition Survey
  updateTemplateIds(knex, 15, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.ELK); //Elk Aerial Non SRB Recruit Composition Survey

  updateTemplateIds(knex, 16, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.DEER); //Deer Aerial Non SRB Recruit Composition Survey
  updateTemplateIds(knex, 17, INTENDED_OUTCOME.RECRUITMENT, WILD_TAXON_IDS.DEER); //Deer Ground Transect Recruit Composition Survey
}

/*
  TEMPLATE NAMES
    Moose SRB or Composition Survey
    Moose Recruitment Survey
    Goat Composition or Recruitment Survey
    Sheep Composition or Recruitment Survey
    Moose Composition Survey
    Moose SRB Survey
    Moose Transect Distance Survey
    Sheep Population Total Count Recruitment Composition Survey
    Goat Population Total Count Recruitment Composition Survey
    Elk Aerial Transect Distance Sampling Recruitment Composition Survey
    Elk Aerial SRB Recruit Composition Survey
    Elk Aerial Non SRB Recruit Composition Survey
    Deer Aerial Non SRB Recruit Composition Survey
    Deer Ground Transect Recruit Composition Survey
*/
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

const updateTemplateIds = async (knex: Knex, templateId: number, intendedOutcome: string | null, wldTaxon: string) => {
  await knex.raw(`
    UPDATE
      ${DB_SCHEMA}.template_methodology_species tms
    SET
      intended_outcome_id = ${intendedOutcome},
      wldtaxonomic_units_id = ${wldTaxon}
    WHERE
      template_methodology_species_id = ${templateId}
    ;
  `);
};
