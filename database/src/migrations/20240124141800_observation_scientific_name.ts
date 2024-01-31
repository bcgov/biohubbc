import { Knex } from 'knex';

/**
 * Adds itis_scientific_name and itis_tsn id to survery_observations table
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql 
    SET search_path = 'biohub';

    ALTER TABLE survey_observation ADD itis_tsn integer;
    ALTER TABLE survey_observation ADD itis_scientific_name varchar(300);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
