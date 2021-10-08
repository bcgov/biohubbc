import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const DB_RELEASE = 'release.0.32';

/**
 * Apply changes required to the survey_summary_details table
 * and populate the populate_summary_submission_message_type table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const populate_summary_submission_message_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_summary_submission_message_type.sql')
  );

  await knex.raw(`
    SET SEARCH_PATH = ${DB_SCHEMA},public, biohub_dapi_v1;
    SET SCHEMA 'biohub_dapi_v1';
    SET ROLE biohub_api;

    DROP VIEW if exists survey_summary_detail;

    SET ROLE postgres;
    SET SEARCH_PATH = biohub;

    DROP INDEX if exists survey_summary_detail_uk1;

    CREATE UNIQUE INDEX survey_summary_detail_uk1 ON survey_summary_detail(survey_summary_submission_id, study_area_id, parameter, stratum, sightability_model);

    ALTER TABLE survey_summary_detail add column analysis_method varchar(100);
    ALTER TABLE survey_summary_detail alter column total_area_surveyed_sqm type numeric(8,3);

    ${populate_summary_submission_message_type}

    -- create the views
    SET SEARCH_PATH = biohub_dapi_v1;
    SET ROLE biohub_api;

    CREATE OR REPLACE VIEW survey_summary_detail as select * from biohub.survey_summary_detail;

    SET ROLE postgres;
    SET SEARCH_PATH = biohub;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
