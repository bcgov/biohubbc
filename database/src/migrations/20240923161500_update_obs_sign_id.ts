import { Knex } from 'knex';

/**
 * Bug fix:
 * Observation subcount sign id cannot be null, so this updates observation subcount records to change null values to 'direct sighting'.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    UPDATE observation_subcount
    SET observation_subcount_sign_id = (SELECT observation_subcount_sign_id FROM observation_subcount_sign WHERE lower(name) = 'direct sighting')
    WHERE observation_subcount_sign_id IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
