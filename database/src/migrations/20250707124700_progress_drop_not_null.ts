import { Knex } from 'knex';

/**
 * Make survey progress nullable
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- MAKE progress_id NULLABLE FOR SURVEYS
    ----------------------------------------------------------------------------------------

    ALTER TABLE survey ALTER COLUMN progress_id DROP NOT NULL;

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
