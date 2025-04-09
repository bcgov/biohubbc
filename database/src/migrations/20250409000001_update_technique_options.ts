import { Knex } from 'knex';

/**
 * UPDATES TO EXISTING CONCEPTS:
 *
 * - Adds camera trap and pit tag attributes 
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
