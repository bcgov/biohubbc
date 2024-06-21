import { Knex } from 'knex';

/**
 * Optimize geometry related columns
 *
 * Remove:
 *  - Project start date
 *  - Project end date
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    
  SET SEARCH_PATH='biohub,biohub_dapi_v1';

  -- Drop the views
  DROP VIEW IF EXISTS biohub_dapi_v1.project;
  DROP VIEW IF EXISTS biohub_dapi_v1.project_program;

  -- Drop the project_program table if it exists
  DROP TABLE IF EXISTS biohub.project_program;

  -- Drop the triggers
  DROP TRIGGER IF EXISTS project_val ON biohub.project;
  DROP TRIGGER IF EXISTS survey_val ON biohub.survey;
  DROP TRIGGER IF EXISTS permit_val ON biohub.permit;

  -- Drop the functions associated with the triggers
  DROP FUNCTION IF EXISTS biohub.tr_project();
  DROP FUNCTION IF EXISTS biohub.tr_permit();
  DROP FUNCTION IF EXISTS biohub.tr_survey();

  -- Drop columns start_date and end_date from the project table
  ALTER TABLE biohub.project DROP COLUMN start_date;
  ALTER TABLE biohub.project DROP COLUMN end_date;

  -- Recreate the view
  CREATE OR REPLACE VIEW biohub_dapi_v1.project AS SELECT * FROM biohub.project;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
