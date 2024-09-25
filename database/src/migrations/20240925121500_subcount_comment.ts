import { Knex } from 'knex';

/**
 * Add comment column to observation subcounts
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub,biohub_dapi_v1;

    ALTER TABLE biohub.observation_subcount ADD COLUMN comment VARCHAR(1000);
    COMMENT ON COLUMN observation_subcount.comment IS 'A comment or note about the subcount record.'


    CREATE OR REPLACE VIEW biohub_dapi_v1.observation_subcount AS SELECT * FROM biohub.observation_subcount;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
