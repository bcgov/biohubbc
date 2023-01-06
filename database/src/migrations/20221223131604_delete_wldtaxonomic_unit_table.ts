import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub_dapi_v1;
  drop view wldtaxonomic_units;
  drop view template_methodology_species;
  drop view summary_template_species;
  drop view study_species;

  set search_path=biohub;

  ALTER TABLE template_methodology_species DROP CONSTRAINT "Refwldtaxonomic_units218";
  ALTER TABLE summary_template_species DROP CONSTRAINT "Refwldtaxonomic_units220";
  ALTER TABLE study_species DROP CONSTRAINT "Refwldtaxonomic_units159";

  drop table if exists wldtaxonomic_units cascade;

  set search_path=biohub_dapi_v1;
  create or replace view template_methodology_species as select * from biohub.template_methodology_species;
  create or replace view summary_template_species as select * from biohub.summary_template_species;
  create or replace view study_species as select * from biohub.study_species;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
