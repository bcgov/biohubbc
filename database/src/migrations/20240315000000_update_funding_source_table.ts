import { Knex } from 'knex';

/**
 * Added unique key constraint to survey funding source table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Add unique key constraints
    ----------------------------------------------------------------------------------------
    CREATE UNIQUE INDEX survey_funding_source_uk1 ON survey_funding_source(funding_source_id, survey_id);

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------
    set search_path=biohub_dapi_v1;

    create or replace view survey_funding_source as select * from biohub.survey_funding_source;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
