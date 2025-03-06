import { Knex } from 'knex';

/**
 * Migrate existing uuid columns that are NULL to have a UUID value.
 *
 * 1. Generate UUIDs for existing uuid columns that are NULL
 * 2. Set uuid columns to NOT NULL
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    ----------------------------------------------------------------------------------------
    -- Drop Views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW IF EXISTS survey;
    DROP VIEW IF EXISTS project;
    DROP VIEW IF EXISTS project_attachment;
    DROP VIEW IF EXISTS project_report_attachment;
    DROP VIEW IF EXISTS survey_attachment;
    DROP VIEW IF EXISTS survey_report_attachment;
    DROP VIEW IF EXISTS survey_summary_submission;
    DROP VIEW IF EXISTS survey_telemetry_credential_attachment;


    ----------------------------------------------------------------------------------------
    -- Generate UUIDs for existing uuid columns that are NULL
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    UPDATE survey SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE project SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE project_attachment SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE project_report_attachment SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE survey_attachment SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE survey_report_attachment SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE survey_summary_submission SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;
    UPDATE survey_telemetry_credential_attachment SET uuid = public.gen_random_uuid() WHERE uuid IS NULL;

    ----------------------------------------------------------------------------------------
    -- Set uuid columns to NOT NULL
    ----------------------------------------------------------------------------------------

    ALTER TABLE survey ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE project ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE project_attachment ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE project_report_attachment ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE survey_attachment ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE survey_report_attachment ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE survey_summary_submission ALTER COLUMN uuid SET NOT NULL;
    ALTER TABLE survey_telemetry_credential_attachment ALTER COLUMN uuid SET NOT NULL;


    ----------------------------------------------------------------------------------------
    -- Recreate Views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW survey AS SELECT * FROM biohub.survey;
    CREATE OR REPLACE VIEW project AS SELECT * FROM biohub.project;
    CREATE OR REPLACE VIEW project_attachment AS SELECT * FROM biohub.project_attachment;
    CREATE OR REPLACE VIEW project_report_attachment AS SELECT * FROM biohub.project_report_attachment;
    CREATE OR REPLACE VIEW survey_attachment AS SELECT * FROM biohub.survey_attachment;
    CREATE OR REPLACE VIEW survey_report_attachment AS SELECT * FROM biohub.survey_report_attachment;
    CREATE OR REPLACE VIEW survey_summary_submission AS SELECT * FROM biohub.survey_summary_submission;
    CREATE OR REPLACE VIEW survey_telemetry_credential_attachment AS SELECT * FROM biohub.survey_telemetry_credential_attachment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
