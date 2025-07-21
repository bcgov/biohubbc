import { Knex } from 'knex';

/**
 * - Adds ARUs as a sampling method
 * - Adds a column to the survey_sample_period table to store comments
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ---------------------------------------------------------------------------------------------------
    ---------------------- Add ARU as a sampling method option ------------------------------------
    ---------------------------------------------------------------------------------------------------

    INSERT INTO method_lookup (name, description, record_effective_date)
    VALUES ('Acoustic Recording Unit', 'Detecting species using an Acoustic Recording Unit (ARU)', now());

    --------------------------------------------------------------------------------------------------
    --------------------- Insert column for comment in survey_sample_period --------------------------
    --------------------------------------------------------------------------------------------------

    ALTER TABLE survey_sample_period
    ADD COLUMN comment TEXT;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
