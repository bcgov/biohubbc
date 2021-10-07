import * as fs from 'fs';
import Knex from 'knex';
import path from 'path';

const DB_USER_API_PASS = process.env.DB_USER_API_PASS;
const DB_USER_API = process.env.DB_USER_API;
const DB_SCHEMA = process.env.DB_SCHEMA;

const DB_RELEASE = 'release.0.32';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const populate_summary_submission_message_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_summary_submission_message_type.sql')
  );

  await knex.raw(`

    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;


    Alter table survey_summary_detail
    add column analysis_method varchar(100),
    alter column total_area_surveyed_sqm set numeric(8,3)
    ;

    

    DROP INDEX survey_summary_detail_uk1;

    CREATE UNIQUE INDEX survey_summary_detail_uk1 ON survey_summary_detail(survey_summary_submission_id, study_area_id, parameter, stratum, sightability_model);



    -- setup biohub api schema
    -- create schema if not exists biohub_dapi_v1;

    -- setup api user
    -- create user ${DB_USER_API} password '${DB_USER_API_PASS}';
    -- alter schema biohub_dapi_v1 owner to ${DB_USER_API};

    -- Grant rights on biohub_dapi_v1 to biohub_api user
    -- grant all on schema biohub_dapi_v1 to ${DB_USER_API};
    -- grant all on schema biohub_dapi_v1 to postgres;
    -- alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to ${DB_USER_API};
    -- alter DEFAULT PRIVILEGES in SCHEMA biohub_dapi_v1 grant ALL on tables to postgres;

    -- Biohub grants
    -- GRANT USAGE ON SCHEMA biohub TO ${DB_USER_API};
    -- ALTER DEFAULT PRIVILEGES IN SCHEMA biohub GRANT ALL ON TABLES TO ${DB_USER_API};

    -- alter role ${DB_USER_API} set search_path to biohub_dapi_v1, biohub, public, topology;


    -- populate look up tables
    -- set search_path = biohub;

    ${populate_summary_submission_message_type}



    -- create the views
    set search_path = biohub_dapi_v1;
    set role biohub_api;

    create or replace view survey_summary_detail as select * from biohub.survey_summary_detail;

    set role postgres;
    set search_path = biohub;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
