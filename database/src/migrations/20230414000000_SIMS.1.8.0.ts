import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub_dapi_v1;

  drop view if exists project_funding_source;
  
  set search_path=biohub;

  ALTER TABLE project_funding_source ALTER COLUMN funding_amount DROP NOT NULL;
  ALTER TABLE project_funding_source ALTER COLUMN investment_action_category_id DROP NOT NULL;
  alter table project_funding_source add column first_nations_id integer;

  COMMENT ON COLUMN project_funding_source.first_nations_id IS 'System generated surrogate primary key identifier.';

  drop index project_funding_source_uk1;
  CREATE UNIQUE INDEX project_funding_source_uk1 ON project_funding_source(funding_source_project_id, investment_action_category_id, project_id, first_nations_id);
  CREATE INDEX "Ref127233" ON project_funding_source(first_nations_id);

  ALTER TABLE project_funding_source ADD CONSTRAINT "Reffirst_nations233" 
    FOREIGN KEY (first_nations_id)
    REFERENCES first_nations(first_nations_id);

  set search_path=biohub_dapi_v1;
  
  create or replace view project_funding_source as select * from biohub.project_funding_source;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
