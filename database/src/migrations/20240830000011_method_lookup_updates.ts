import { Knex } from 'knex';

/**
 * Update method_lookup vlaues and associated attributes to accomodate spi-migration data and for other future data. 
 *
 * This migration file updates  values into method lookup table, technique attribute qual and quant tables,
 * method lookup quant and qual and qualitative options and attractants
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  SET SEARCH_PATH=biohub, public;

----------------------------------------------------------------------------------------
  --Adding more values to the method lookup table. 
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
---------------------------------- TO DO LIST-------------------------------------------

-- Include Update to Radio, adding variables such as device type with handheld or tower being qual options 
-- Include Flight altitude to drone quant
-- Include Drone model and camera type to qualitative
-- Include Quant types for hair snag, height of snag, number of snags, Qual = Trap type (barbed wire, adhesive strips, brush station), substrate type, soil, rock, vegetation, -- -- material. 
----------------------------------------------------------------------------------------
    INSERT into method_lookup (name, description)
    VALUES
    (
        'Drone',
        'Using drones for ecological data collection involves capturing high-resolution imagery and spatial data to monitor wildlife and habitats efficiently and non-invasively'
    ),
     (
        'Hair snag',
        'Hair snag involves collecting hair samples from wildlife using specially designed devices to non-invasively monitor species presence, genetic diversity, and health.'
    ),
     (
        'Undetermined',
        'Method of data collection not specified or insufficient data to determine the method'
    )
        `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
