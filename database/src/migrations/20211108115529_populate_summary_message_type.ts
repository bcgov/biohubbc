import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_SCHEMA = process.env.DB_SCHEMA;

const DB_RELEASE = 'release.0.34';

export async function up(knex: Knex): Promise<void> {
  const populate_summary_submission_message_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_summary_submission_message_type.sql')
  );

  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ${populate_summary_submission_message_type}

    set search_path = biohub_dapi_v1;
    set role biohub_api;

    create or replace view summary_submission_message_type as select * from ${DB_SCHEMA}.summary_submission_message_type;

    set role postgres;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
