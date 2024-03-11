import { Knex } from 'knex';

/**
 * Create new tables with initial seed data:
 * - sign
 *
 * Update existing tables:
 * - Add 'progress' column to Survey table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Update existing method_lookup values
    ----------------------------------------------------------------------------------------
    SET search_path = biohub;

    -- Update 'Electrofishing'
    UPDATE method_lookup
    SET name = 'Electrofishing',
        description = 'Recording observations of aquatic species temporarily stunned with an electrical current.'
    WHERE name = 'Electro Fishing';

    -- Update 'Camera Trap'
    UPDATE method_lookup
    SET name = 'Camera trap', description = 'Recording observations of species using a motion-activated camera attached to a fixed object like a tree.'
    WHERE name = 'Camera Trap';

    -- Update 'Box Trap' and its description
    UPDATE method_lookup
    SET name = 'Box or live trap',
        description = 'Capturing species in a box-like structure that closes shut when a species enters the trap.'
    WHERE name = 'Box Trap';

    -- Delete 'Dip Net'
    DELETE FROM method_lookup
    WHERE name = 'Dip Net';


    ----------------------------------------------------------------------------------------
    -- Add new existing method_lookup values
    ----------------------------------------------------------------------------------------


    INSERT INTO method_lookup (name, description)
    VALUES
    (
      'Aerial transect',
      'Recording observations from an aircraft or drone along a specific path.'
    ),
    (
      'Ground transect',
      'Recording observations from the ground along a specific path, travelling either on foot or by vehicle.'
    ),
    (
      'Aquatic transect',
      'Recording observations from the water along a specific path, travelling either on foot or by watercraft.'
    ),
    (
      'Underwater transect',
      'Recording observations under the water along a specific path.'
    ),
    (
      'Quadrat',
      'Recording observations within a square or rectangular frame placed on the ground.'
    ),
    (
      'Mist net',
      'Capturing species in a mesh net suspended between two poles or trees.'
    ),
    (
      'Point count',
      'Recording observations of species while standing in a fixed location.'
    ),
    (
      'Pitfall trap',
      'Capturing species in a container or hole that organisms fall into and are unable to escape from.'
    );

    ----------------------------------------------------------------------------------------
    -- Add site_strategy values
    ----------------------------------------------------------------------------------------
    INSERT INTO site_strategy (name, description, record_effective_date)
    VALUES
    (
      'Opportunistic',
      'Selecting sites haphazardly without a probability-based strategy.',
      'NOW()'
    );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
