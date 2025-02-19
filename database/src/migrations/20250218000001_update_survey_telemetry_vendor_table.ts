import { Knex } from 'knex';

/**
 * Update tables:
 * survey_telemetry_vendor_credential - add survey_id column and make survey_telemetry_credential_attachment_id nullable.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    ALTER TABLE survey_telemetry_vendor_credential ADD COLUMN survey_id INTEGER NOT NULL, ALTER COLUMN survey_telemetry_credential_attachment_id DROP NOT NULL;
    COMMENT ON COLUMN survey_telemetry_vendor_credential.survey_id IS 'Foreign key to the survey table.';

    -- Add foreign key constraints
    ALTER TABLE survey_telemetry_vendor_credential 
      ADD CONSTRAINT survey_telemetry_vendor_credential_fk2
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
