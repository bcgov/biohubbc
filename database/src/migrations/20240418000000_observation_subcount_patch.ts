import { Knex } from 'knex';

/**
 * Fixes an issue with the 20240202000001_observation_subcount_attribute_tables migration.
 *
 * Specifically, the migration did not account for existing observation records. This meant that existing observation
 * records would have no matching subcount record. This is invalid, as all observation records should have at least one
 * subcount record. In this particular case, no errors were thrown by the app, but no observations would render in the
 * frontend because of the missing subcount records.
 *
 * This migration fixes the issue by creating a subcount record for each observation record that does not already have
 * one.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

    SET SEARCH_PATH=biohub;


    -- Create an observation subcount record for each survey observation record that does not already have one.
    INSERT INTO 
      observation_subcount 
      (
        survey_observation_id, 
        subcount
      )
      SELECT 
        survey_observation.survey_observation_id, 
        survey_observation.count 
      FROM 
        survey_observation
      WHERE NOT EXISTS (
        SELECT 
          1 
        FROM 
          observation_subcount 
        WHERE 
          observation_subcount.survey_observation_id = survey_observation.survey_observation_id
      );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
