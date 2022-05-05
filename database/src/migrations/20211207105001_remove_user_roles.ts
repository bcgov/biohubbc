import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

enum OLD_SYSTEM_ROLE {
  GOVERNMENT_USER = 'Government User',
  PUBLIC_USER = 'Public User',
  EXTERNAL_USER = 'External User'
}

enum NEW_SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_CREATOR = 'Creator',
  DATA_ADMINISTRATOR = 'Data Administrator'
}

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  UPDATE
    system_user_role
  SET
    system_role_id = (select system_role_id from system_role where name = '${NEW_SYSTEM_ROLE.DATA_ADMINISTRATOR}')
  WHERE
    system_role_id = (select system_role_id from system_role where name = '${OLD_SYSTEM_ROLE.GOVERNMENT_USER}');


  UPDATE
    system_user_role
  SET
    system_role_id = (select system_role_id from system_role where name = '${NEW_SYSTEM_ROLE.PROJECT_CREATOR}')
  WHERE
    system_role_id = (select system_role_id from system_role where name = '${OLD_SYSTEM_ROLE.EXTERNAL_USER}');

  UPDATE
    system_user_role
  SET
    system_role_id = (select system_role_id from system_role where name = '${NEW_SYSTEM_ROLE.PROJECT_CREATOR}')
  WHERE
    system_role_id = (select system_role_id from system_role where name = '${OLD_SYSTEM_ROLE.PUBLIC_USER}');


  --Delete from system_user

  DELETE FROM system_role WHERE name = '${OLD_SYSTEM_ROLE.GOVERNMENT_USER}';
  DELETE FROM system_role WHERE name = '${OLD_SYSTEM_ROLE.EXTERNAL_USER}';
  DELETE FROM system_role WHERE name = '${OLD_SYSTEM_ROLE.PUBLIC_USER}';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
