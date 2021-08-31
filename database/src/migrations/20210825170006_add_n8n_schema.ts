import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create schema if not exists n8n;

    GRANT ALL ON SCHEMA n8n TO postgres;

    set search_path = n8n, public;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
