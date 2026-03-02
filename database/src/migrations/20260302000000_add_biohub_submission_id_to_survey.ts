import { Knex } from 'knex';

/**
 * Add `biohub_submission_id` column to the `survey` table.
 *
 * This stores the integer submission ID returned by the BioHub Platform when a survey is first
 * published (`POST /api/submission/upload/archive`). Subsequent publishes use this ID to append
 * to the existing BioHub submission (`POST /api/submission/:submissionId/upload`) instead of
 * creating a new one.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub,public;

    ALTER TABLE survey
      ADD COLUMN IF NOT EXISTS biohub_submission_id integer;

    COMMENT ON COLUMN survey.biohub_submission_id IS 'The BioHub Platform submission ID returned when the survey was first published. Used to append subsequent publishes to the same BioHub submission.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub,public;

    ALTER TABLE survey
      DROP COLUMN IF EXISTS biohub_submission_id;
  `);
}
