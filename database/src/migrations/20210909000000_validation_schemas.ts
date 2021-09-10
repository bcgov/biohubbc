import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const VALIDATION_SCHEMAS = 'template_methodology_species_validations';

const DB_SCHEMA = process.env.DB_SCHEMA;

const csm1_wld4147_t1 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld4147_t1.json'));
const csm1_wld4147_t2 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld4147_t2.json'));
const csm1_wld4147_t3 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld4147_t3.json'));
const csm1_wld4147_t4 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld4147_t4.json'));
const csm1_wld4147_t5 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm1_wld4147_t5.json'));

const csm2_wld4147_t1 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm2_wld4147_t1.json'));
const csm2_wld4147_t2 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm2_wld4147_t2.json'));
const csm2_wld4147_t3 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm2_wld4147_t3.json'));
const csm2_wld4147_t4 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm2_wld4147_t4.json'));
const csm2_wld4147_t5 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm2_wld4147_t5.json'));

const csm3_wld4147_t6 = fs.readFileSync(path.join(__dirname, VALIDATION_SCHEMAS, 'csm3_wld4147_t6.json'));

enum COMMON_SURVEY_METHODOLOGY {
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
  COMPOSITION = 'Composition',
  RECRUITMENT = 'Recruitment'
}

enum SPECIES_NAME {
  MOOSE = 'Moose'
}

enum TEMPLATE_NAME {
  MOOSE_SRB_OR_COMPOSITION_SURVEY_SKEENA = 'Moose SRB or Composition Survey Skeena',
  MOOSE_SRB_OR_COMPOSITION_SURVEY_OMINECA = 'Moose SRB or Composition Survey Omineca',
  MOOSE_SRB_OR_COMPOSITION_SURVEY_CARIBOO = 'Moose SRB or Composition Survey Cariboo',
  MOOSE_SRB_OR_COMPOSITION_SURVEY_OKANAGAN = 'Moose SRB or Composition Survey Okanagan',
  MOOSE_SRB_OR_COMPOSITION_SURVEY_KOOTENAY = 'Moose SRB or Composition Survey Kootenay',
  MOOSE_RECRUITMENT_SURVEY = 'Moose Recruitment Survey'
}

const validationSchemas = [
  //Common Survey Methodology: Stratified Random Block
  {
    fileName: csm1_wld4147_t1.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_SKEENA
  },
  {
    fileName: csm1_wld4147_t2.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_OMINECA
  },
  {
    fileName: csm1_wld4147_t3.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_CARIBOO
  },
  {
    fileName: csm1_wld4147_t4.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_OKANAGAN
  },
  {
    fileName: csm1_wld4147_t5.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_KOOTENAY
  },

  // Common Survey Methodology: Composition
  {
    fileName: csm2_wld4147_t1.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_SKEENA
  },
  {
    fileName: csm2_wld4147_t2.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_OMINECA
  },
  {
    fileName: csm2_wld4147_t3.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_CARIBOO
  },
  {
    fileName: csm2_wld4147_t4.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_OKANAGAN
  },
  {
    fileName: csm2_wld4147_t5.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY_KOOTENAY
  },

  // Common Survey Methodology: Recruitment
  {
    fileName: csm3_wld4147_t6.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.RECRUITMENT,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_RECRUITMENT_SURVEY
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
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
  `);

  for (const validationSchema of validationSchemas) {
    // check if user is already in the system users table
    await knex.raw(`
      ${updateValidation(
        validationSchema.fileName,
        validationSchema.cms,
        validationSchema.species,
        validationSchema.template
      )}
    `);
  }

  await knex.raw(`
    set role postgres;
    set search_path = biohub;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

/**
 * SQL to update the template_methodology_species validation row.
 * The select statement returns the template_methodology_species_id
 * The validation field is filled with a JSON schema based on the combination of:
 * 1) common_survey_methodology
 * 2) species name
 * 3) template name
 *
 * @param {string} validationJSON file with content specifying the validation rules
 * @param {string} csm common survey methodology needed for the query
 * @param {string} species species `english name` from the wldtaxonomic_units table needed for the query
 * @param {string} template name of the template
 */
const updateValidation = (validationJSON: string, csm: string, species: string, template: string) => `
  UPDATE
    biohub.template_methodology_species tms
  SET
    validation= '${validationJSON}'
  WHERE
    tms.template_methodology_species_id =
    (SELECT
      template_methodology_species_id
    FROM
      template_methodology_species tms
    LEFT JOIN
      common_survey_methodology csm
    ON
      tms.common_survey_methodology_id = csm.common_survey_methodology_id
    LEFT JOIN
      wldtaxonomic_units wu
    ON
      tms.wldtaxonomic_units_id = wu.wldtaxonomic_units_id
    LEFT JOIN
      template t
    ON
      tms.template_id = t.template_id
    WHERE
      csm.name = '${csm}'
    AND
      wu.english_name = '${species}'
    AND
      t.name= '${template}'
    );
`;
