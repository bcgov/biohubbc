import { Knex } from 'knex';
import { summaryTemplateValidationJson, SUMMARY_TEMPLATE_NAME } from './summary_template_species_validations/summary_template_validation';

const DB_SCHEMA = process.env.DB_SCHEMA;

enum WILD_TAXON_IDS {
  MOOSE = 4147, // M_ALAM
  GOAT = 4165, // M-ORAM
  SHEEP = 8619, // M-OVDA
  ELK = 4149, // M-CECA
}

interface IValidationSchema {
  validation: string; // Validation JSON
  summaryTemplateName: SUMMARY_TEMPLATE_NAME; // Name of the summary template
  species: number; // Wild taxonomic units code
}

const validationSchema: IValidationSchema[] = [
  {
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.MOOSE_SUMMARY_RESULTS,
    species: WILD_TAXON_IDS.MOOSE
  },
  {
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.SHEEP_SUMMARY_RESULTS,
    species: WILD_TAXON_IDS.SHEEP
  },{
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.GOAT_SUMMARY_RESULTS,
    species: WILD_TAXON_IDS.GOAT
  },{
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.ELK_SUMMARY_RESULTS,
    species: WILD_TAXON_IDS.ELK
  }
];

/**
 * Populate summary template validations.
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

  for (const schema of validationSchema) {
    await knex.raw(`
      INSERT INTO
        ${DB_SCHEMA}.summary_template_species (summary_template_id, wldtaxonomic_units_id, validation, create_date)
      VALUES (
        (SELECT summary_template_id FROM summary_template WHERE name = '${schema.summaryTemplateName}'),
        '${schema.species}', '${schema.validation}', now()
      );
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
