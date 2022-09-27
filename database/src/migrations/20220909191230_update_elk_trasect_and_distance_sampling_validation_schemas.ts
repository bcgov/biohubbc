import { Knex } from 'knex';
import { elkAerialTransectDistanceJSON } from './template_methodology_species_validations/elk_aerial_transect_distance_1';

const DB_SCHEMA = process.env.DB_SCHEMA;

const elk_aerial_transect_validation = elkAerialTransectDistanceJSON;

enum COMMON_SURVEY_METHODOLOGY {
  ENCOUNTER_TRANSECTS = 'Encounter Transects'
}

enum TEMPLATE_NAME {
  ELK_AERIAL_TRANSECT_DISTANCE_SAMPLING_RECRUITMENT_COMPOSITION = 'Elk Aerial Transect Distance Sampling Recruitment Composition Survey'
}

const validationSchema = [
  // Common Survey Methodology: Composition, SRB
  {
    v_schema: JSON.stringify(elk_aerial_transect_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.ENCOUNTER_TRANSECTS,
    template: TEMPLATE_NAME.ELK_AERIAL_TRANSECT_DISTANCE_SAMPLING_RECRUITMENT_COMPOSITION
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
    set search_path =  biohub;


    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.ELK_AERIAL_TRANSECT_DISTANCE_SAMPLING_RECRUITMENT_COMPOSITION}', '1.0', now(), 'Elk Aerial Transect Distance Sampling Recruitment Composition Survey');

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
