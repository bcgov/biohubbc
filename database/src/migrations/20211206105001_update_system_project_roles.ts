import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  INSERT INTO system_role (name, record_effective_date, description) values ('Data Administrator', now(), '');

  UPDATE system_role SET name = 'Creator' WHERE name = 'Project Administrator';

  UPDATE project_role SET name = 'Editor' WHERE name = 'Project Team Member';

  UPDATE project_role SET name = 'Viewer' WHERE name = 'Project Reviewer';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
