import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add `occurrence_submission.` column and update `occurrence_submission` view.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=${DB_SCHEMA};

    alter table survey_attachment add column security_review_timestamp timestamptz(6);
    comment on column survey_attachment.security_review_timestamp is 'The datetime that the security review for the survey attachment was completed.';

    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
    create or replace view survey_attachment as select * from ${DB_SCHEMA}.survey_attachment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
