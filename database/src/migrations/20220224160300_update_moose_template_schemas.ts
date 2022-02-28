import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const VALIDATION_SCHEMAS_FOLDER = 'template_methodology_species_validations';

const moose_srb_or_composition_validation = fs.readFileSync(
  path.join(__dirname, VALIDATION_SCHEMAS_FOLDER, 'moose_srb_or_composition_survey_6.json')
);

enum COMMON_SURVEY_METHODOLOGY {
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
  COMPOSITION = 'Composition',
  RECRUITMENT = 'Recruitment'
}

enum SPECIES_NAME {
  MOOSE = 'Moose'
}

enum TEMPLATE_NAME {
  MOOSE_SRB_OR_COMPOSITION_SURVEY = 'Moose SRB or Composition Survey'
}

const validationSchemas = [
  // Common Survey Methodology: Stratified Random Block or Composition
  {
    v_schema: moose_srb_or_composition_validation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY
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
  `);
  for (const v_t_schema of validationSchemas) {
    await knex.raw(`
      ${updateValidation(v_t_schema.v_schema, v_t_schema.cms, v_t_schema.species, v_t_schema.template)}
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
 * 1) common_survey_methodology
 * 2) species name
 * 3) template name
 *
 * @param {string} transformationSchema validation rules config
 * @param {string} csm common survey methodology needed for the query
 * @param {string} species species `english name` from the wldtaxonomic_units table needed for the query
 * @param {string} template name of the template
 */
const updateValidation = (validationSchema: string, csm: string, species: string, template: string) => `
  UPDATE
    biohub.template_methodology_species tms
  SET
    validation = '${validationSchema}'
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
      wu.end_date isnull
    AND
      t.name = '${template}'
    );
`;
