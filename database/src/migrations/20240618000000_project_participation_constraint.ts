import { Knex } from 'knex';

/**
 * Add constraint to ensure a user can only have one role within a Project
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  SET SEARCH_PATH = biohub,biohub_dapi_v1;

  DROP VIEW IF EXISTS biohub_dapi_v1.project_participation;

  ----------------------------------------------------------------------------------------
  -- Add constraint to ensure a user can only have one role within a Project
  ----------------------------------------------------------------------------------------

  ALTER TABLE biohub.project_participation
  ADD CONSTRAINT project_participation_uk2 UNIQUE (system_user_id, project_id);

  ----------------------------------------------------------------------------------------
  -- Update view
  ----------------------------------------------------------------------------------------

  CREATE OR REPLACE VIEW biohub_dapi_v1.project_participation AS SELECT * FROM biohub.project_participation;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
