import { Knex } from 'knex';

/**
 * Rename the `environment_unit` enum to `quantitative_unit`.
 *
 * Originally created in migration `20240417000000_obsevation_environment_tables.ts` when only the environment tables
 * used it. But, it really contains generic units that can be used in other tables as well.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Rename the environment_unit enum to quantitative_unit
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    ALTER TYPE environment_unit RENAME TO quantitative_unit;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
