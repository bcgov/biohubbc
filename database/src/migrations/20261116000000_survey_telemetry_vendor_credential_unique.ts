import { Knex } from 'knex';

/**
 * Update tables:
 *
 * survey_telemetry_vendor_credential
 * - Delete duplicate credential records for the same device in a survey, keeping the earliest record.
 * - Add unique constraint on (survey_id, device_key).
 *
 * A device can appear in more than one credential file uploaded to a survey, which previously inserted one credential
 * record per file. Telemetry queries that joined to this table returned each telemetry record once per duplicate.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Delete duplicate credential records, keeping the earliest record for each survey device
    ----------------------------------------------------------------------------------------

    DELETE FROM survey_telemetry_vendor_credential stvc
    USING survey_telemetry_vendor_credential earlier
    WHERE stvc.survey_id = earlier.survey_id
    AND stvc.device_key = earlier.device_key
    AND stvc.survey_telemetry_vendor_credential_id > earlier.survey_telemetry_vendor_credential_id;

    ----------------------------------------------------------------------------------------
    -- Add unique constraint
    ----------------------------------------------------------------------------------------

    CREATE UNIQUE INDEX survey_telemetry_vendor_credential_uk1 ON survey_telemetry_vendor_credential(survey_id, device_key);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
