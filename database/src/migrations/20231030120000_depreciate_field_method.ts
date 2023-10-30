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

    COMMENT ON TABLE field_method IS '(Depreciated) A common methodology is a specific species inventory protocol that may be implemented across various species and strata. Examples include Stratified Random Block.';
    COMMENT ON COLUMN survey.field_method_id IS '(Depreciated) System generated surrogate primary key identifier.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
