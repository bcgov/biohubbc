import { Knex } from 'knex';

/**
 * TEST
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    Select 1;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
