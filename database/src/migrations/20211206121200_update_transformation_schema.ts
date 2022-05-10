import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const TRANSFORMATION_SCHEMAS_FOLDER = 'template_methodology_species_transformations';

const moose_srb_or_composition_transformation = fs.readFileSync(
  path.join(__dirname, TRANSFORMATION_SCHEMAS_FOLDER, 'moose_srb_or_composition_survey_4.json')
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

const transformationSchemas = [
  // Common Survey Methodology: Stratified Random Block or Composition
  {
    t_schema: moose_srb_or_composition_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY
  },
  {
    t_schema: moose_srb_or_composition_transformation.toString(),
    cms: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    species: SPECIES_NAME.MOOSE,
    template: TEMPLATE_NAME.MOOSE_SRB_OR_COMPOSITION_SURVEY
  }
];

/**
 * Populate template transformation.
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
  for (const transformationSchema of transformationSchemas) {
    await knex.raw(`
      ${updateTransformationSchema(
        transformationSchema.t_schema,
        transformationSchema.cms,
        transformationSchema.species,
        transformationSchema.template
      )}
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

/**
 * SQL to update the template_methodology_species transformation row.
 *
 * @param {string} transformationSchema transformation rules config
 * @param {string} csm common survey methodology needed for the query
 * @param {string} species species `english name` from the wldtaxonomic_units table needed for the query
 * @param {string} template name of the template
 */
const updateTransformationSchema = (transformationSchema: string, csm: string, species: string, template: string) => `
  UPDATE
    biohub.template_methodology_species tms
  SET
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
      wu.english_name = '${species}'
    AND
      wu.end_date isnull
    AND
      t.name = '${template}'
    );
`;
