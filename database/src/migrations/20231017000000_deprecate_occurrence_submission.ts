import { Knex } from 'knex';

/**
 * Indicates deprecation of occurrence submission table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';
    
    COMMENT ON TABLE  occurrence_submission IS '(Deprecated in favor of survey_observation_submission) Provides a historical listing of published dates and pointers to raw data versions for occurrence submissions.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
