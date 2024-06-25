import { Knex } from 'knex';

/**
 * Drop deprecated study_species.wldtaxonomic_units_id column.
 * Drop deprecated survey.field_method_id column.
 *
 * Migrate outdated project_attachment.file_type and survey_attachment.file_type values:
 * - Deprecated values 'Spatial Data' and 'Data File' are now 'Other'.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql  
    ----------------------------------------------------------------------------------------
    -- Drop views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    DROP VIEW IF EXISTS study_species;
    DROP VIEW IF EXISTS survey;

    ----------------------------------------------------------------------------------------
    -- Alter tables/data
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    -- Drop deprecated columns
    ALTER TABLE study_species DROP COLUMN wldtaxonomic_units_id;
    ALTER TABLE survey DROP COLUMN field_method_id;

    -- Migrate deprecated file_type values
    UPDATE project_attachment SET file_type = 'Other' WHERE file_type NOT IN ('Other', 'KeyX', 'Report');
    UPDATE survey_attachment SET file_type = 'Other' WHERE file_type NOT IN ('Other', 'KeyX', 'Report');

    ----------------------------------------------------------------------------------------
    -- Update views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW study_species as SELECT * FROM biohub.study_species;
    CREATE OR REPLACE VIEW survey as SELECT * FROM biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
