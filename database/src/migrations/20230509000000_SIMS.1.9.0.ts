import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub;

  ALTER TABLE project_funding_source ALTER COLUMN funding_start_date drop NOT NULL;
  ALTER TABLE project_funding_source ALTER COLUMN funding_end_date drop NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
