import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  SET search_path = ${DB_SCHEMA};

  drop function if exists api_get_eml_data_package;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
