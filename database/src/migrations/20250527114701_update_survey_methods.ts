import { Knex } from 'knex';

/**
 * Added unique key constraint to survey funding source table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

  SET SEARCH_PATH=biohub;

  ----------------------------------------------------------------------------------------
  --Deleting previous rows that no longer apply to the method_lookup table
  ----------------------------------------------------------------------------------------
  DELETE FROM method_lookup
  WHERE name IN ('Aerial transect', 'Ground transect', 'Aquatic transect', 'Underwater transect');  

  ----------------------------------------------------------------------------------------
  --Update existing values in the method lookup-table
  ----------------------------------------------------------------------------------------


  ----------------------------------------------------------------------------------------
  --Adding more values to the method lookup table. 
  ----------------------------------------------------------------------------------------

INSERT into method_lookup (name, description)
VALUES
(
    'Gill Net',
    'a fishing net that hangs vertically in the water, trapping fish by their gills when they try to swim through its mesh openings.'
),
(
  'Trawling',
  'Trawling is a fishing method where a large net is dragged along the sea floor or through the water column to catch fish and other marine organisms.'
),
(
    'Mist Net',
    'A mist net works by being suspended vertically between poles in the flight path of birds or bats, entangling them gently in its fine mesh when they fly into it, allowing researchers to safely collect and study them before release.'
),
(
    'Trap Net',
    'A trap net is a stationary fishing device consisting of a series of nets and funnels designed to guide and capture fish or other aquatic animals as they swim through it.'
),
(
    'Rotary Screw Trap',
    'A rotary screw trap is a cylindrical, cone-shaped device used in rivers and streams to capture juvenile fish, particularly salmonids, as they are carried downstream by the current.'
),
(
    'Handheld Net',
    'Using a handheld net as a sampling method involves manually capturing aquatic organisms from water bodies for research or monitoring by sweeping or dipping the net through the water.'
),
(
    'Angling',
    'Angling is a method of fishing that involves using a rod, line, and hook to catch fish.'
),
(
    'Radio Signal Tower',
    'Using a radio signal tower as a sampling method involves tracking the movements and behavior of tagged animals by receiving signals from radio transmitters attached to the animals.'
),
(
    'Radar',
    'Using radar as a sampling method involves detecting and tracking the movement and behavior of animals, particularly birds and bats, by emitting radio waves and analyzing the reflected signals.'
),
(
    'Seine Net',
    'A seine net is used in sample collection to capture fish and other aquatic organisms by encircling them with a vertical net wall, allowing for efficient population and biodiversity assessments in marine and freshwater environments.'
),
(
    'Fish Weir',
    'A fish weir is used in sample collection to guide and trap fish by directing their movement through a series of barriers or enclosures, enabling researchers to monitor fish populations and migrations in rivers and streams.'
),
(
    'Fish Wheel',
    'A fish wheel is used in sample collection to automatically capture fish as they swim into rotating baskets or compartments, allowing for continuous and passive monitoring of fish populations and migrations in rivers.'
),
(
    'Egg Mats',
    'Egg mats are used in sample collection to provide a substrate for fish eggs to adhere to, enabling researchers to monitor and assess spawning activities and egg deposition in aquatic environments.'
),
(
    'Setline',
    'Set lines are used in sample collection to capture fish by baiting hooks attached to a long fishing line anchored in place, allowing for targeted sampling of specific fish species over a period of time.'
)
;

  `);
}
export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }
  