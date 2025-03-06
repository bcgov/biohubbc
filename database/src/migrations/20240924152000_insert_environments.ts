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

    ----------------------------------------------------------------------------------------
    -- Insert new qualitative environments
    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative
      (
        name,
        description
      )
    VALUES
      (
        'Moon phase',
        'The phase of the moon.'
      );

    ----------------------------------------------------------------------------------------
    -- Insert new qualitative environment options
    ----------------------------------------------------------------------------------------

    INSERT INTO environment_qualitative_option
        (
        environment_qualitative_id,
        name,
        description
        )
    VALUES
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'New',
            'The moon is not visible, as it is positioned between the Earth and the Sun.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'Full',
            'The entire face of the moon is illuminated, appearing as a bright circle in the sky.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'First quarter',
            'Half of the moon is illuminated, with the right side lit up, marking the first half of the lunar cycle.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'Last quarter',
            'Half of the moon is illuminated, with the left side lit up, indicating the final phase of the lunar cycle.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'Waning gibbous',
            'More than half of the moon is illuminated, gradually decreasing towards the last quarter.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'Waxing gibbous',
            'More than half of the moon is illuminated, increasing towards the full moon.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'New crescent',
            'A thin sliver of the moon is visible, just after the new moon phase, growing towards the first quarter.'
        ),
        (
            (SELECT environment_qualitative_id FROM environment_qualitative WHERE name = 'Moon phase'),
            'Old crescent',
            'A thin crescent of the moon is visible, just before the new moon phase, shrinking from the last quarter.'
        );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
