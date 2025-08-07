import { Knex } from 'knex';

/**
 * - Adds pit reader station as a sampling method
 * - Adds camera trap and pit tag reader attributes
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ---------------------------------------------------------------------------------------------------
    ---------------- Update observation subcount table to accept a critterbase critter id  ------------
    ---------------------------------------------------------------------------------------------------
    ALTER TABLE observation_subcount
    ADD COLUMN IF NOT EXISTS critterbase_critter_id uuid;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
