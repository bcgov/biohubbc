import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path=biohub;

  ALTER TABLE template_methodology_species
  ADD CONSTRAINT unique_wldtaxonomic_units_id_template_id UNIQUE (template_id, wldtaxonomic_units_id);

  set search_path=biohub_dapi_v1;
  create or replace view template_methodology_species as select * from biohub.template_methodology_species;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
