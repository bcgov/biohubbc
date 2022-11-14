import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
/**
 * Permutate options for validation schemas
 *
 * @param {Knex} knex
 * @param {string} templateName
 * @param {any[]} fieldMethod
 * @param {string[]} wldTaxon
 * @param {string} validationSchema
 */
export const permutateTemplates = async (
  knex: Knex,
  templateName: string,
  fieldMethod: any[],
  wldTaxon: string[],
  validationSchema: string
) => {
  wldTaxon.forEach((taxon) => {
    fieldMethod.forEach((field) => {
      CreateTemplateRows(knex, templateName, field, taxon, validationSchema);
    });
  });
};

/**
 * Create Template Row in DB
 *
 * @param {Knex} knex
 * @param {string} templateName
 * @param {(string | null)} fieldMethod
 * @param {string} wldTaxon
 * @param {string} validationSchema
 */
const CreateTemplateRows = async (
  knex: Knex,
  templateName: string,
  fieldMethod: string | null,
  wldTaxon: string,
  validationSchema: string
) => {
  await knex.raw(`
    INSERT INTO
      ${DB_SCHEMA}.template_methodology_species (field_method_id, template_id, wldtaxonomic_units_id, validation)
    VALUES
      (
        (select field_method_id from field_method where name = '${fieldMethod}'),
        (select template_id from template where name = '${templateName}'),
        '${wldTaxon}',
        '${validationSchema}'
      )
    ;
  `);
};
