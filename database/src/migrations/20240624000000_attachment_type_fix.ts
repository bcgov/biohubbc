import { Knex } from 'knex';

/**
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
    -- Alter tables/data
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    -- Migrate deprecated file_type values
    UPDATE project_attachment SET file_type = 'Other' WHERE file_type NOT IN ('Other', 'KeyX', 'Report');
    UPDATE survey_attachment SET file_type = 'Other' WHERE file_type NOT IN ('Other', 'KeyX', 'Report');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
