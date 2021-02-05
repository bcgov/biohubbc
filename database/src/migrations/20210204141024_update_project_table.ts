import * as Knex from 'knex';

/**
 * Update the project table, drop the not null constraint from the scientific_collection_permit_number column.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE project ALTER COLUMN scientific_collection_permit_number DROP NOT NULL;
  `);
}

/**
 * Update the project table, re-add the not null constraint to the scientific_collection_permit_number column.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE project ALTER COLUMN scientific_collection_permit_number SET NOT NULL;
  `);
}
