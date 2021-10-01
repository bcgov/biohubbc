import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- Add system rules
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Project Attachment','{"target":"project_attachment","rule":"","project":""}', true, now()); -- 1
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Survey Attachment','{"target":"survey_attachment","rule":"","project":""}', true, now()); -- 2
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Occurrence','{"target":"occurrence","rule":"","project":""}', true, now()); -- 3
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Project Report Attachment','{"target":"project_report_attachment","rule":"","project":""}', true, now()); -- 4
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date) values ('New Survey Report Attachment','{"target":"survey_report_attachment","rule":"","project":""}', true, now()); -- 5

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  delete from  ${DB_SCHEMA}.security_rule where system_rule = true;

  `);
}
