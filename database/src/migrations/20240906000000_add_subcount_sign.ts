import { Knex } from 'knex';

/**
 * Update observation_subcount_sign value to accomodate spi-migration data and for other future data.
 *
 * This migration file inserts values into observation subcount sign table, 
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  SET SEARCH_PATH=biohub, public;

----------------------------------------------------------------------------------------
---------------------------------Insert new oss values--------------------------------------
----------------------------------------------------------------------------------------
    INSERT INTO biohub.observation_subcount_sign (create_date, name, description)
    VALUES (now(), 'Rub or scratch spot', 'This observation was made due to evidence associated with a rubbing or scratch mark created by am animal');
      
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
