import { Knex } from 'knex';

/**
 * UPDATES TO EXISTING CONCEPTS:
 *
 * - Adds a unique constraint to the telemetry_manual table to prevent duplicate telemetry records
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub, public;

    ALTER TABLE telemetry_manual ADD CONSTRAINT telemetry_manual_uk1 UNIQUE (deployment_id, acquisition_date, latitude, longitude);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
