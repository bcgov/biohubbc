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

    ALTER TABLE survey_funding_source DROP COLUMN amount;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
