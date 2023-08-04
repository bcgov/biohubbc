import { Knex } from 'knex';

/**
 * Rename miss-named audit and journal triggers for the region_lookup, project_region, and survey_region tables.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
	set search_path=biohub;

    ALTER TRIGGER audit_submission_spatial_component ON region_lookup RENAME TO audit_region_lookup;
    ALTER TRIGGER audit_spatial_transform ON project_region RENAME TO audit_project_region;
    ALTER TRIGGER audit_spatial_transform_submission ON survey_region RENAME TO audit_survey_region;

    ALTER TRIGGER journal_submission_spatial_component ON region_lookup RENAME TO journal_region_lookup;
    ALTER TRIGGER journal_spatial_transform ON project_region RENAME TO journal_project_region;
    ALTER TRIGGER journal_spatial_transform_submission ON survey_region RENAME TO journal_survey_region;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
