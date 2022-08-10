import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';
import { mooseSRBOrCompositionJSON } from './template_methodology_species_validations/moose_srb_or_composition_survey_7';

const DB_SCHEMA = process.env.DB_SCHEMA;

const moose_srb_or_composition_validation = mooseSRBOrCompositionJSON;

const TRANSFORMATION_SCHEMAS_FOLDER = 'template_methodology_species_transformations';

const moose_srb_or_composition_transformation = fs.readFileSync(
  path.join(__dirname, TRANSFORMATION_SCHEMAS_FOLDER, 'moose_srb_or_composition_survey_6.json')
);

enum COMMON_SURVEY_METHODOLOGY {
  STRATIFIED_RANDOM_BLOCK = 'Stratified Random Block'
}

enum TEMPLATE_NAME {
  MOOSE_SRB_OR_COMPOSITION_SURVEY = 'Moose SRB or Composition Survey'
}

const transformationAndValidationSchemas = [
  // Common Survey Methodology: Stratified Random Block or Composition
  {
    v_schema: JSON.stringify(moose_srb_or_composition_validation),
    t_schema: moose_srb_or_composition_transformation.toString(),
    field_method: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
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
  for (const v_t_schema of transformationAndValidationSchemas) {
    await knex.raw(`
      ${updateValidationAndTransformation(
        v_t_schema.v_schema,
        v_t_schema.t_schema,
        v_t_schema.field_method,
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
 * @param {string} field_method field methodology needed for the query
 * @param {string} species species `english name` from the wldtaxonomic_units table needed for the query
 * @param {string} template name of the template
 */
const updateValidationAndTransformation = (
  validationSchema: string,
  transformationSchema: string,
  field_method: string,
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
      field_method fm
    ON
      tms.field_method_id = fm.field_method_id
    LEFT JOIN
      template t
    ON
      tms.template_id = t.template_id
    WHERE
      fm.name = '${field_method}'
    AND
      t.name = '${template}'
    );
`;
