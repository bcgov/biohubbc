import { Knex } from 'knex';

/**
 * Populate lookup values for the environment_quantitative, environment_qualitative, and
 * environment_qualitative_option tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Populate lookup tables.
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub, public;

    INSERT INTO environment_quantitative
      (
        name,
        description,
        min,
        max,
        unit
      )
    VALUES
      (
        'Snow Cover',
        'The percent snow cover (%).',
        0,
        1,
        'percent'
      ),
      (
        'Veg Cover',
        'The percent vegetation cover (%).',
        0,
        1,
        'percent'
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative
      (
        name,
        description
      )
    VALUES
      (
        'Wind Direction',
        'The compass direction of the wind.'
      );

    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative_option
      (
        environment_qualitative_id,
        name,
        description
      )
    VALUES
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind Direction'),
        'North',
        'North direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind Direction'),
        'East',
        'East direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind Direction'),
        'South',
        'South direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind Direction'),
        'West',
        'West direction.'
      );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
