import { Knex } from 'knex';

/**
 * Populate habitat_feature_type lookup table with initial records.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Insert initial habitat_feature_type records
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    INSERT INTO
      habitat_feature_type (name, description)
    VALUES
      ('Nest', 'A structure for holding eggs or offspring'),
      ('Burrow', 'An excavated hole that descends below ground for denning, sheltering, or foraging'),
      ('Den', 'An excavated cavity that descends below ground or under a tree root system for denning'),
      ('Mineral lick', 'A naturally occurring mineral deposit with evidence of use by species'),
      ('Wallow', 'An area of mud or shallow water that species roll or relax in, often leaving a depression in the ground'),
      ('Hibernaculum', 'A cavity or structure that species use to hibernate'),
      ('Roost', 'A structure where species aggregate for rest or sleep'),
      ('Hot spring', 'A source of water that is heated geothermally and comes to the surface, as a seep or forming a pool');
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
