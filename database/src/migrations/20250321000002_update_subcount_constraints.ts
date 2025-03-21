import { Knex } from 'knex';

/**
 * Add new constraints to prevent bad data in the following tables:
 *
 * observation_subcount_quantitative_measurement:
 *  - Add unuique constraints to ensure only one quantitative critterbase_taxon_measurement_id can be recorded per observation_subcount_id
 *
 * observation_subcount_qualitative_measurement:
 *  - Add unuique constraints to ensure only one qualitative critterbase_taxon_measurement_id can be recorded per observation_subcount_id
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    -- Add unique constraint to ensure only one quantitative critterbase_taxon_measurement_id can be recorded per observation_subcount_id
    CREATE UNIQUE INDEX observation_subcount_quantitative_measurement_uk1 ON observation_subcount_quantitative_measurement(observation_subcount_id, critterbase_taxon_measurement_id);

    -- Add unique constraint to ensure only one qualitative critterbase_taxon_measurement_id can be recorded per observation_subcount_id
    CREATE UNIQUE INDEX observation_subcount_qualitative_measurement_uk1 ON observation_subcount_qualitative_measurement(observation_subcount_id, critterbase_taxon_measurement_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
