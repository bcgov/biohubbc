import { Knex } from 'knex';

/**
 * Drops the `amount` column from survey_funding_source.
 *
 * Rationale: SIMS does not intend to track dollar amounts because they will be inaccurate. Dollar amounts are known by funding providers.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    
    SET SEARCH_PATH=biohub;

    ALTER TABLE telemetry_credential_vectronic ALTER COLUMN idcom SET DATA TYPE NUMERIC;
    ALTER TABLE telemetry_credential_lotek ADD COLUMN devicekey VARCHAR(1000) NOT NULL;
    COMMENT ON COLUMN telemetry_credential_lotek.devicekey IS 'The Lotek device key.';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
