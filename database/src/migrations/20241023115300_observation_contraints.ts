import { Knex } from 'knex';

/**
 * Drops NOT NULL constraints on observation latitude, longitude, date and time.
 * Observations can be valid without locations and timestamps. eg. A surveyor only measured the start and end of their
 * sampling period, not the time of each observation made during that period.
 *
 * When interpreting the data, observations without locations/timestamps are assumed to inherit the location/time range of
 * associated sampling records.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    ALTER TABLE survey_observation
    ALTER COLUMN latitude DROP NOT NULL,
    ALTER COLUMN longitude DROP NOT NULL,
    ALTER COLUMN observation_date DROP NOT NULL,
    ALTER COLUMN observation_time DROP NOT NULL,
    ADD CONSTRAINT survey_observation_date_check
    CHECK (observation_date IS NOT NULL OR survey_sample_period_id IS NOT NULL),
    ADD CONSTRAINT survey_observation_location_check
    CHECK ((latitude IS NOT NULL AND longitude IS NOT NULL) OR survey_sample_period_id IS NOT NULL);

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
