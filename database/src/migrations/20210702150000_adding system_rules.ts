import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- Add system rules
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule) values ('New Project Attachment','{}', true); -- 1
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule) values ('New Survey Attachment','{}', true); -- 2
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule) values ('New Occurrence','{}', true); -- 3

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  delete from  ${DB_SCHEMA}.security_rule where system_rule = true;

  `);
}
