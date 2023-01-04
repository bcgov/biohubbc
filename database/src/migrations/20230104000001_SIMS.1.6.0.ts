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

  drop view if exists project_attachment;
  drop view if exists project_report_attachment;
  drop view if exists survey_attachment;
  drop view if exists survey_report_attachment;
  drop view if exists survey_summary_submission;
  
  set search_path=biohub;

  alter table project_attachment add column uuid uuid DEFAULT public.gen_random_uuid();
  alter table project_report_attachment add column uuid uuid DEFAULT public.gen_random_uuid();
  alter table survey_attachment add column uuid uuid DEFAULT public.gen_random_uuid();
  alter table survey_report_attachment add column uuid uuid DEFAULT public.gen_random_uuid();
  alter table survey_summary_submission add column uuid uuid DEFAULT public.gen_random_uuid();

  set search_path=biohub_dapi_v1;  
  
  create or replace view project_attachment as select * from biohub.project_attachment;
  create or replace view project_report_attachment as select * from biohub.project_report_attachment;
  create or replace view survey_attachment as select * from biohub.survey_attachment;
  create or replace view survey_report_attachment as select * from biohub.survey_report_attachment;
  create or replace view survey_summary_submission as select * from biohub.survey_summary_submission;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
