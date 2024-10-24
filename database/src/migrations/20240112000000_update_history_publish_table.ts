import { Knex } from 'knex';

/**
 * Alter survey publish tables to match latest response data from BioHub.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    -------------------------------------------------------------------------
    -- Drop old views and constraints
    -------------------------------------------------------------------------
    SET schema 'biohub';
    SET search_path = public, biohub_dapi_v1;

    -- drop old views
    DROP VIEW if exists survey_attachment_publish;
    DROP VIEW if exists survey_report_publish;
    DROP VIEW if exists survey_metadata_publish;

    ----------------------------------------------------------------------------------------
    -- Add new columns
    ----------------------------------------------------------------------------------------
    SET search_path=biohub;

    ALTER TABLE survey_attachment_publish ALTER COLUMN artifact_revision_id TYPE varchar(255);
    COMMENT ON COLUMN survey_attachment_publish.artifact_revision_id IS 'The SIMS attachment UUID.';

    ALTER TABLE survey_report_publish ALTER COLUMN artifact_revision_id TYPE varchar(255);
    COMMENT ON COLUMN survey_attachment_publish.artifact_revision_id IS 'The SIMS report attachment UUID.';

    ALTER TABLE survey_metadata_publish DROP COLUMN queue_id;

    ALTER TABLE survey_metadata_publish ADD COLUMN submission_uuid uuid NOT NULL;
    COMMENT ON COLUMN survey_metadata_publish.submission_uuid IS 'The SIMS submission UUID';

    CREATE UNIQUE INDEX survey_metadata_publish_uk1 ON survey_metadata_publish(submission_uuid);

    ----------------------------------------------------------------------------------------
    -- Create new views
    ----------------------------------------------------------------------------------------
    set search_path=biohub_dapi_v1;

    create or replace view survey_attachment_publish as select * from biohub.survey_attachment_publish;
    create or replace view survey_report_publish as select * from biohub.survey_report_publish;
    create or replace view survey_metadata_publish as select * from biohub.survey_metadata_publish;
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
