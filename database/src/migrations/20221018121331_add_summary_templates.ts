import { Knex } from 'knex';
import { SUMMARY_TEMPLATE_NAME } from './summary_template_species_validations/summary_template_validation';

const DB_SCHEMA = process.env.DB_SCHEMA;

const insertTemplate = async (
  knex: Knex,
  templateName: string,
  templateVersion: string,
  templateDescription: string
) => {
  await knex.raw(`
    INSERT INTO
      ${DB_SCHEMA}.summary_template (name, version, record_effective_date, description)
    VALUES
      ('${templateName}', '${templateVersion}', now(), '${templateDescription}')
    ;
	`);
};

/**
 * Populate Summary Templates.
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

  // Moose Summary Results Template
  await insertTemplate(
    knex,
    SUMMARY_TEMPLATE_NAME.MOOSE_SUMMARY_RESULTS,
    '1.0',
    SUMMARY_TEMPLATE_NAME.MOOSE_SUMMARY_RESULTS
  );

  // Sheep Summary Results Template
  await insertTemplate(
    knex,
    SUMMARY_TEMPLATE_NAME.SHEEP_SUMMARY_RESULTS,
    '1.0',
    SUMMARY_TEMPLATE_NAME.SHEEP_SUMMARY_RESULTS
  );

  // Goat Summary Results Template
  await insertTemplate(
    knex,
    SUMMARY_TEMPLATE_NAME.GOAT_SUMMARY_RESULTS,
    '1.0',
    SUMMARY_TEMPLATE_NAME.GOAT_SUMMARY_RESULTS
  );

  // Elk Summary Results Template
  await insertTemplate(
    knex,
    SUMMARY_TEMPLATE_NAME.ELK_SUMMARY_RESULTS,
    '1.0',
    SUMMARY_TEMPLATE_NAME.ELK_SUMMARY_RESULTS
  );
}

/*
  TEMPLATE NAMES
    Moose Summary Results Template
    Sheep Summary Results Template
    Goat Summary Results Template
    Elk Summary Results Template
*/
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
