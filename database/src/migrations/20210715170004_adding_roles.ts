import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- Add new roles (3,4,5)
  insert into  ${DB_SCHEMA}.system_role (name, record_effective_date, description) values ('Government User', now(), '');
  insert into  ${DB_SCHEMA}.system_role (name, record_effective_date, description) values ('External User', now(), '');
  insert into  ${DB_SCHEMA}.system_role (name, record_effective_date, description) values ('Public User', now(), '');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  delete from  ${DB_SCHEMA}.system_role where name in ('Government User','External User','Public User');

  `);
}
