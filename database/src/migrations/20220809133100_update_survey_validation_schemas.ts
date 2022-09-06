import { Knex } from 'knex';
import { goatRecruitmentCompositionJSON } from './template_methodology_species_validations/goat_population_recruitment_composition';
import { mooseCompositionJSON } from './template_methodology_species_validations/moose_composition_survey_1';
import { mooseSrbJSON } from './template_methodology_species_validations/moose_srb_survey_1';
import { mooseTransectDistanceJSON } from './template_methodology_species_validations/moose_transect_distance_survey_1';
import { sheepRecruitmentCompositionJSON } from './template_methodology_species_validations/sheep_population_recruitment_composition_survey';

const DB_SCHEMA = process.env.DB_SCHEMA;

const moose_composition_validation = mooseCompositionJSON;
const moose_srb_validation = mooseSrbJSON;
const moose_transect_distance_validation = mooseTransectDistanceJSON;
const sheep_population_recruitment_compostion_validation = sheepRecruitmentCompositionJSON;
const goat_population_recruitment_compostion_validation = goatRecruitmentCompositionJSON;

enum COMMON_SURVEY_METHODOLOGY {
  COMPOSITION = 'Composition',
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
  TRANSECT = 'Encounter Transects',
  POPULATION_COUNT = 'Total Count'
}

enum TEMPLATE_NAME {
  MOOSE_COMPOSITION_SURVEY = 'Moose Composition Survey',
  MOOSE_SRB_SURVEY = 'Moose SRB Survey',
  MOOSE_TRANSECT_DISTANCE_SURVEY = 'Moose Transect Distance Survey',
  SHEEP_POPULATION_TOTAL_COUNT = 'Sheep Population Total Count Recruitment Composition Survey',
  GOAT_POPULATION_TOTAL_COUNT = 'Goat Population Total Count Recruitment Composition Survey'
}

const validationSchema = [
  // Common Survey Methodology: Composition, SRB, Transect
  {
    v_schema: JSON.stringify(moose_composition_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    template: TEMPLATE_NAME.MOOSE_COMPOSITION_SURVEY
  },
  {
    v_schema: JSON.stringify(moose_srb_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    template: TEMPLATE_NAME.MOOSE_SRB_SURVEY
  },
  {
    v_schema: JSON.stringify(moose_transect_distance_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.TRANSECT,
    template: TEMPLATE_NAME.MOOSE_TRANSECT_DISTANCE_SURVEY
  },
  {
    v_schema: JSON.stringify(sheep_population_recruitment_compostion_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.POPULATION_COUNT,
    template: TEMPLATE_NAME.SHEEP_POPULATION_TOTAL_COUNT
  },
  {
    v_schema: JSON.stringify(goat_population_recruitment_compostion_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.POPULATION_COUNT,
    template: TEMPLATE_NAME.GOAT_POPULATION_TOTAL_COUNT
  }
];

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

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.MOOSE_COMPOSITION_SURVEY}', '1.0', now(), 'Moose Composition Survey');

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.MOOSE_SRB_SURVEY}', '1.0', now(), 'Moose SRB Survey');

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.MOOSE_TRANSECT_DISTANCE_SURVEY}', '1.0', now(), 'Moose Transect Distance Survey');

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.SHEEP_POPULATION_TOTAL_COUNT}', '1.0', now(), 'Sheep Population Total Count Recruitment Composition Survey');

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.GOAT_POPULATION_TOTAL_COUNT}', '1.0', now(), 'Goat Population Total Count Recruitment Composition Survey');
  `);

  for (const v_schema of validationSchema) {
    await knex.raw(`
      ${insertValidation(v_schema.v_schema, v_schema.field_method, v_schema.template)}
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

/**
 * SQL to update the template_methodology_species validation row.
 * The select statement returns the template_methodology_species_id
 * The validation field is filled with a JSON schema based on the combination of:
 * 1) field_method
 * 2) template_name
 *
 * @param {string} validationSchema
 * @param {string} field_method
 * @param {string} template_name
 */
const insertValidation = (validationSchema: string, field_method: string, template_name: string) => `
  INSERT INTO
    ${DB_SCHEMA}.template_methodology_species (field_method_id, template_id, validation)
  VALUES
    (
      (select field_method_id from field_method where name = '${field_method}'),
      (select template_id from template where name = '${template_name}'),
      '${validationSchema}'
    );
`;
