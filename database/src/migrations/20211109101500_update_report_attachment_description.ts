import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Add a new record to the `proprietor_type` lookup table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET schema '${DB_SCHEMA}';
    SET search_path = public, biohub_dapi_v1;

    DROP VIEW if exists project_report_attachment;
    DROP VIEW if exists survey_report_attachment;

    SET search_path = ${DB_SCHEMA};

    ALTER TABLE project_report_attachment ALTER COLUMN description TYPE varchar(3000);
    ALTER TABLE survey_report_attachment ALTER COLUMN description TYPE varchar(3000);

    SET search_path = biohub_dapi_v1;
    SET ROLE biohub_api;

    CREATE OR REPLACE VIEW project_report_attachment as SELECT * FROM ${DB_SCHEMA}.project_report_attachment;
    CREATE OR REPLACE VIEW survey_report_attachment as SELECT * FROM ${DB_SCHEMA}.survey_report_attachment;

    SET ROLE postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
