import { Knex } from 'knex';

/**
 * In the migration `20240722000000_method_technique` a duplicate constraint was created.
 *
 * This migration removes the duplicate constraint.
 *
 * Constraints:
 * - method_technique_attribute_qualitative_fk4
 * - method_technique_attribute_qualitative_fk5
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- DROP DUPLICATE CONSTRAINT
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    ALTER TABLE method_technique_attribute_qualitative DROP CONSTRAINT IF EXISTS method_technique_attribute_qualitative_fk5;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
