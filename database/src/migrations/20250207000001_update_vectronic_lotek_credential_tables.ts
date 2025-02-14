import { Knex } from 'knex';

/**
 * Changes the idcom colum type from INTEGER to NUMERIC in the telemetry_credential_vectronic table.
 * Adds a new column devicekey to the telemetry_credential_lotek table.
 *
 * Rationale: Required to properly import device keys.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    
    SET SEARCH_PATH=biohub;

    ALTER TABLE telemetry_credential_vectronic ALTER COLUMN idcom SET DATA TYPE VARCHAR(50);
    ALTER TABLE telemetry_credential_lotek ADD COLUMN key VARCHAR(1000) NOT NULL;
    COMMENT ON COLUMN telemetry_credential_lotek.key IS 'The Lotek device key that corresponds to the Key label in the CFG file.';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
