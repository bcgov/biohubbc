import { Knex } from 'knex';

/**
 * Adding Visibility as an environmental variable *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Insert new quantitative environmental variables 
    ----------------------------------------------------------------------------------------

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
        'Visibility',
        'The maximum distance (in meters) at which an observer can clearly see wildlife, affected by weather, vegetation, lighting, or terrain.',
        0,
        10000,
        'meters'
      );

    
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
