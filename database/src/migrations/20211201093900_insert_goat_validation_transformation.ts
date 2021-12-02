import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const TRANSFORMATION_SCHEMAS_FOLDER = 'template_methodology_species_transformations';

const VALIDATION_SCHEMAS_FOLDER = 'template_methodology_species_validations';

const goat_composition_or_recruitment_validation = fs.readFileSync(
  path.join(__dirname, VALIDATION_SCHEMAS_FOLDER, 'goat_composition_or_recruitment_1.json')
);

const goat_composition_or_recruitment_transformation = fs.readFileSync(
  path.join(__dirname, TRANSFORMATION_SCHEMAS_FOLDER, 'goat_composition_or_recruitment_1.json')
);

enum COMMON_SURVEY_METHODOLOGY {
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
  COMPOSITION = 'Composition',
  RECRUITMENT = 'Recruitment'
}

enum TEMPLATE_NAME {
  GOAT_COMPOSITION_OR_RECRUITMENT_SURVEY = 'Goat Composition or Recruitment Survey'
}

const validationAndTransformationSchemas = [
  // Common Survey Methodology: Stratified Random Block or Composition
  {
    v_schema: goat_composition_or_recruitment_validation.toString(),
    t_schema: goat_composition_or_recruitment_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION
  },
  {
    v_schema: goat_composition_or_recruitment_validation.toString(),
    t_schema: goat_composition_or_recruitment_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.RECRUITMENT
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
      ('${TEMPLATE_NAME.GOAT_COMPOSITION_OR_RECRUITMENT_SURVEY}', '1.0', now(), 'Goat Composition or Recruitment Survey');
  `);

  for (const v_t_schema of validationAndTransformationSchemas) {
    await knex.raw(`
      ${insertValidationAndTransformation(v_t_schema.v_schema, v_t_schema.t_schema, v_t_schema.cms)}
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
const insertValidationAndTransformation = (validationSchema: string, transformationSchema: string, csm: string) => `
  insert into
    ${DB_SCHEMA}.template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id, validation, transform)
  values
    (
      (select common_survey_methodology_id from common_survey_methodology where name = '${csm}'),
      (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ORAM'),
      (select template_id from template where name = '${TEMPLATE_NAME.GOAT_COMPOSITION_OR_RECRUITMENT_SURVEY}'),
      '${validationSchema}',
      '${transformationSchema}'
    );
`;
