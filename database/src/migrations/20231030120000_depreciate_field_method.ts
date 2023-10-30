import { Knex } from 'knex';

/**
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    COMMENT ON TABLE field_method IS '';
    COMMENT ON COLUMN survey.field_method_id IS '';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
