import { Knex } from 'knex';

/**
 * Add new columns to survey_sample_period table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
-- Add new columns
  ----------------------------------------------------------------------------------------

SET search_path=biohub;

ALTER TABLE survey_sample_period ADD start_time time;
ALTER TABLE survey_sample_period ADD end_time time;

COMMENT ON COLUMN survey_sample_period.start_time     IS 'start time of the survey observation';
COMMENT ON COLUMN survey_sample_period.end_time       IS 'end time of the survey observation';

----------------------------------------------------------------------------------------
-- Create new views
  ----------------------------------------------------------------------------------------

set search_path=biohub_dapi_v1;

create or replace view survey_sample_period as select * from biohub.survey_sample_period;
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
