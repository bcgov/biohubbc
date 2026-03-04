import { Knex } from 'knex';

/**
 * Add `submission_upload_uuid` to `survey_metadata_publish`.
 *
 * Backbone returns both submissionId (parent submission) and submissionUploadId (this upload).
 * We store submission_uuid = submissionId, submission_upload_uuid = submissionUploadId so the
 * delete endpoint (DELETE /submission/:submissionId/upload/:submissionUploadId) has both IDs.
 *
 * Allow multiple uploads per submission by making the unique constraint on submission_upload_uuid.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub,public;

    ALTER TABLE survey_metadata_publish
      ADD COLUMN IF NOT EXISTS submission_upload_uuid uuid;

    COMMENT ON COLUMN survey_metadata_publish.submission_uuid IS 'The BioHub submission ID (parent resource).';
    COMMENT ON COLUMN survey_metadata_publish.submission_upload_uuid IS 'The BioHub submission upload ID (this upload). Used with submission_uuid for DELETE /submission/:submissionId/upload/:submissionUploadId.';

    DROP INDEX IF EXISTS survey_metadata_publish_uk1;
    CREATE UNIQUE INDEX survey_metadata_publish_uk1 ON survey_metadata_publish(submission_upload_uuid);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub,public;

    DROP INDEX IF EXISTS survey_metadata_publish_uk1;
    CREATE UNIQUE INDEX survey_metadata_publish_uk1 ON survey_metadata_publish(submission_uuid);

    ALTER TABLE survey_metadata_publish
      DROP COLUMN IF EXISTS submission_upload_uuid;
  `);
}
