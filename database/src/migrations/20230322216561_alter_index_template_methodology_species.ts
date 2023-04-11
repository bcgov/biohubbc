import { Knex } from 'knex';
const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  DROP INDEX template_methodology_species_nuk1 ;
  CREATE UNIQUE INDEX template_methodology_species_nuk1 ON template_methodology_species(template_id, wldtaxonomic_units_id);

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
