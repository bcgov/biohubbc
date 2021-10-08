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

    set search_path = ${DB_SCHEMA},public, biohub_dapi_v1;
    set schema 'biohub_dapi_v1';
    set role biohub_api;

    drop view if exists survey_summary_detail;
    DROP INDEX if exists survey_summary_detail_uk1;

    set role postgres;
    set search_path = biohub;


    ALTER TABLE survey_summary_detail add column analysis_method varchar(100);
    ALTER TABLE survey_summary_detail alter column total_area_surveyed_sqm type numeric(8,3);


    ${populate_summary_submission_message_type}


    -- create the views
    set search_path = biohub_dapi_v1;
    set role biohub_api;

    create or replace view survey_summary_detail as select * from biohub.survey_summary_detail;

    set role postgres;
    set search_path = biohub;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
