import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  UPDATE system_user_role SET system_role_id = 5 WHERE system_role_id = 3;
  UPDATE system_user_role SET system_role_id = 6 WHERE system_role_id = 4;
  UPDATE system_user_role SET system_role_id = 6 WHERE system_role_id = 5;

  --Delete from system_user

  DELETE FROM system_role WHERE name = 'Government User';
  DELETE FROM system_role WHERE name = 'External User';
  DELETE FROM system_role WHERE name = 'Public User';


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
