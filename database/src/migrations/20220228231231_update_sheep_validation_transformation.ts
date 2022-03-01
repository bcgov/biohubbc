import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const TRANSFORMATION_SCHEMAS_FOLDER = 'template_methodology_species_transformations';

const VALIDATION_SCHEMAS_FOLDER = 'template_methodology_species_validations';

const sheep_composition_or_recruitment_validation = fs.readFileSync(
  path.join(__dirname, VALIDATION_SCHEMAS_FOLDER, 'sheep_composition_or_recruitment_2.json')
);

const sheep_composition_or_recruitment_transformation = fs.readFileSync(
  path.join(__dirname, TRANSFORMATION_SCHEMAS_FOLDER, 'sheep_composition_or_recruitment_2.json')
);

enum COMMON_SURVEY_METHODOLOGY {
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block',
  COMPOSITION = 'Composition',
  RECRUITMENT = 'Recruitment'
}

enum TEMPLATE_NAME {
  SHEEP_COMPOSITION_OR_RECRUITMENT_SURVEY = 'Sheep Composition or Recruitment Survey'
}

const validationAndTransformationSchemas = [
  // Common Survey Methodology: Stratified Random Block or Composition
  {
    v_schema: sheep_composition_or_recruitment_validation.toString(),
    t_schema: sheep_composition_or_recruitment_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: 'M-OVCA',
    template: TEMPLATE_NAME.SHEEP_COMPOSITION_OR_RECRUITMENT_SURVEY
  },
  {
    v_schema: sheep_composition_or_recruitment_validation.toString(),
    t_schema: sheep_composition_or_recruitment_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.RECRUITMENT,
    species: 'M-OVCA',
    template: TEMPLATE_NAME.SHEEP_COMPOSITION_OR_RECRUITMENT_SURVEY
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

  for (const v_t_schema of validationAndTransformationSchemas) {
    await knex.raw(`
    ${updateValidation(
      v_t_schema.v_schema,
      v_t_schema.t_schema,
      v_t_schema.cms,
      v_t_schema.species,
      v_t_schema.template
    )}
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
const updateValidation = (
  validationSchema: string,
  transformationSchema: string,
  csm: string,
  species: string,
  template: string
) => `
 UPDATE
   biohub.template_methodology_species tms
 SET
   validation = '${validationSchema}',
   transform = '${transformationSchema}'
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
     wu.code = '${species}'
   AND
     wu.end_date isnull
   AND
     t.name = '${template}'
   );
`;
