import { Knex } from 'knex';
import { COMMON_SURVEY_METHODOLOGY } from './common/template.enum';
import { elkNonSRBJSON } from './template_methodology_species_validations/elk_non_srb_survey';
import { elkSRBJSON } from './template_methodology_species_validations/elk_srb_survey';

const DB_SCHEMA = process.env.DB_SCHEMA;

const elk_srb_validation = elkSRBJSON;
const elk_non_srb_validation = elkNonSRBJSON;

enum TEMPLATE_NAME {
  ELK_SRB_SURVEY = 'Elk Arial SRB Recruit Composition Survey',
  ELK_NON_SRB_SURVEY = 'Elk Arial Non SRB Recruit Composition Survey'
}

const validationSchema = [
  //Common Survey Methodology: Composition, SRB, Transect, Population Recruitment
  {
    v_schema: JSON.stringify(elk_srb_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.STRATIFIED_RANDOM_BLOCK,
    template: TEMPLATE_NAME.ELK_SRB_SURVEY
  },
  {
    v_schema: JSON.stringify(elk_non_srb_validation),
    field_method: COMMON_SURVEY_METHODOLOGY.COMPOSITION,
    template: TEMPLATE_NAME.ELK_NON_SRB_SURVEY
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
      ('${TEMPLATE_NAME.ELK_SRB_SURVEY}', '1.0', now(), '${TEMPLATE_NAME.ELK_SRB_SURVEY}');

    insert into
      ${DB_SCHEMA}.template (name, version, record_effective_date, description)
    values
      ('${TEMPLATE_NAME.ELK_NON_SRB_SURVEY}', '1.0', now(), '${TEMPLATE_NAME.ELK_NON_SRB_SURVEY}');
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
