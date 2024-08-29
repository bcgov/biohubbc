import { Knex } from 'knex';

/**
 * Inserted new method_lookup values 
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
  ----- inserting method lookup names into method_lookup table ---- 


`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
