import { Knex } from 'knex';
import {
  summaryTemplateValidationJson,
  SUMMARY_TEMPLATE_NAME
} from './summary_template_species_validations/summary_template_validation';

const DB_SCHEMA = process.env.DB_SCHEMA;

const taxonIdLists = {
  // M-OVCA; M-OVCA-CA; M-OVDA; M-OVDA-DA; M-OVDA-ST.
  SHEEP: ['4166', '474', '8619', '475', '476'],

  // M-CEEL; M-CEEL-RO; M-CECA; M-CECA-RO.
  ELK: ['2227', '2228', '4149', '6901'],

  // M-ALAM; M-ALAM-AN; M-ALAM-GI; M-ALAM-SH.
  MOOSE: ['4147', '6897', '6898', '6899'],

  // M-ORAM
  GOAT: ['4165']
};

interface IValidationSchema {
  validation: string; // Validation JSON
  summaryTemplateName: SUMMARY_TEMPLATE_NAME; // Name of the summary template
  species: keyof typeof taxonIdLists; // Wild taxonomic units code
}

const validationSchema: IValidationSchema[] = [
  {
    // Moose
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.MOOSE_SUMMARY_RESULTS,
    species: 'MOOSE'
  },
  {
    // Sheep
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.SHEEP_SUMMARY_RESULTS,
    species: 'SHEEP'
  },
  {
    // Goat
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.GOAT_SUMMARY_RESULTS,
    species: 'GOAT'
  },
  {
    // Elk
    validation: JSON.stringify(summaryTemplateValidationJson),
    summaryTemplateName: SUMMARY_TEMPLATE_NAME.ELK_SUMMARY_RESULTS,
    species: 'ELK'
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
    for (const taxonomicCode of taxonIdLists[schema.species]) {
      await knex.raw(`
        INSERT IGNORE INTO
          ${DB_SCHEMA}.summary_template_species (summary_template_id, wldtaxonomic_units_id, validation, create_date)
        VALUES (
          (SELECT summary_template_id FROM summary_template WHERE name = '${schema.summaryTemplateName}'),
          '${taxonomicCode}', '${schema.validation}', now()
        );
      `);
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
