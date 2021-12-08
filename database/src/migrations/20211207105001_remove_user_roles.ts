import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;


  --DELETE FROM system_user_role where system_role_id in (select id from system_role where name in (3,4,5));

  --Delete from system_user

  DELETE FROM system_role WHERE name = 'Government User';
  DELETE FROM system_role WHERE name = 'External User';
  DELETE FROM system_role WHERE name = 'Public User';



  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
