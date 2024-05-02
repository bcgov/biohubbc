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
        'Snow cover',
        'The percent snow cover (%).',
        0,
        1,
        'percent'
      ),
      (
        'Air temperature',
        'The ambient air temperature (celsius).',
        -50,
        200,
        'celsius'
      ),
      (
        'Water temperature',
        'The water temperature (celsius).',
        -50,
        200,
        'celsius'
      ),
      (
        'Vegetation cover',
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
        'Wind direction',
        'The compass direction of the wind.'
      ),
      (
        'Wind speed',
        'The wind speed category.'
      ),
      (
        'Precipitation',
        'The precipitation category.'
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
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'North',
        'North direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Northeast',
        'Northeast direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Northwest',
        'Northwest direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'East',
        'East direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'South',
        'South direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Southeast',
        'South direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'Southwest',
        'South direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind direction'),
        'West',
        'West direction.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Still air',
        'No detectable wind (0-5 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Weak',
        'Leaves rustle (6-12 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Moderate',
        'Leaves and twigs constantly move (13-19 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Strong',
        'Small branches move, dust rises (20-29 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Very strong',
        'Small trees sway (30-39 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Wind speed'),
        'Intense',
        'Large branches moving, wind whistling (>39 km$$/$$hour).'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'None',
        'No precipitation.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Misty drizzle',
        'No distinct rain drops but can dampen clothing.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Drizzle',
        'Fine rain drops (< 0.5 mm diameter), visible on ground.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Light Rain',
        'Puddles not forming quickly, < 2.5 mm rain$$/$$hour.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Heavy Rain',
        'Puddles form quickly, > 2.5 mm rain$$/$$hour.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Light snow',
        'Snow falling but not accumulating.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Heavy snow',
        'Snow accumulating on the ground.'
      ),
      (
        (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Precipitation'),
        'Hail',
        'Solid ice falling.'
      )
      ;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
