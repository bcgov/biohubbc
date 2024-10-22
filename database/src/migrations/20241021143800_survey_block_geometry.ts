import { Knex } from 'knex';

/**
 * Add geometry-related columns to the survey block table, allowing blocks to be spatial.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub, public;

    ALTER TABLE biohub.survey_block ADD COLUMN geojson JSONB NOT NULL;
    ALTER TABLE biohub.survey_block ADD COLUMN geometry geometry(geometry, 3005);
    ALTER TABLE biohub.survey_block ADD COLUMN geography geography(geometry, 4326);

    COMMENT ON COLUMN survey_block.geojson IS 'A JSON representation of the project boundary geometry that provides necessary details for shape manipulation in client side tools.';
    COMMENT ON COLUMN survey_block.geometry IS 'The containing geometry of the record.';
    COMMENT ON COLUMN survey_block.geography IS 'The containing geography of the record.';

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW biohub_dapi_v1.survey_block AS SELECT * FROM biohub.survey_block;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
