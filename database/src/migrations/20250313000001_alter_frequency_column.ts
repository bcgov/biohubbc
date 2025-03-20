import { Knex } from 'knex';

/**
 * Changes:
 *  - Alter deployment table frequency column type from int4 to decimal.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    -- Alter deployment frequency column from int4 to decimal
    ALTER TABLE deployment ALTER COLUMN frequency TYPE decimal;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
