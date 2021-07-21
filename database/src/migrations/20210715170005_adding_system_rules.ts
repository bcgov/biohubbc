import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- Add system rules
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Project Attachment','{}', true, now()); -- 1
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Survey Attachment','{}', true, now()); -- 2
  insert into  ${DB_SCHEMA}.security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Occurrence','{}', true, now()); -- 3

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  delete from  ${DB_SCHEMA}.security_rule where system_rule = true;

  `);
}
