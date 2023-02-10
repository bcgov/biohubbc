import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub_dapi_v1;

  drop view if exists security;
  drop view if exists security_rule;
  drop view if exists occurrence_data_package;
  drop view if exists occurrence_submission_data_package;
  drop view if exists data_package;
  drop view if exists project_attachment;
  drop view if exists project_report_attachment;
  drop view if exists survey_attachment;
  drop view if exists survey_report_attachment;

  set search_path=biohub;

  drop table if exists security;
  drop table if exists security_rule;
  drop table if exists occurrence_data_package;
  drop table if exists occurrence_submission_data_package;
  drop table if exists data_package;

  alter table project_attachment drop column if exists security_token;
  alter table project_report_attachment drop column if exists security_token;
  alter table survey_attachment drop column if exists security_token;
  alter table survey_report_attachment drop column if exists security_token;

  set search_path=biohub_dapi_v1;  
  
  create or replace view project_attachment as select * from biohub.project_attachment;
  create or replace view project_report_attachment as select * from biohub.project_report_attachment;
  create or replace view survey_attachment as select * from biohub.survey_attachment;
  create or replace view survey_report_attachment as select * from biohub.survey_report_attachment;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
