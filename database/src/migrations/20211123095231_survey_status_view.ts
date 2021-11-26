import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  SET search_path = ${DB_SCHEMA_DAPI_V1};

  DROP VIEW if exists survey_status;

  SET search_path = ${DB_SCHEMA};

  DROP VIEW if exists survey_status;

  CREATE OR REPLACE VIEW survey_status
    AS WITH not_published AS (
       SELECT os.survey_id,
          max(ss.submission_status_id) AS submission_status_id
         FROM occurrence_submission os,
          submission_status ss
        WHERE NOT (EXISTS ( SELECT 1
                 FROM submission_status ss2,
                  submission_status_type sst,
                  occurrence_submission os2
                WHERE os.survey_id = os2.survey_id AND os2.delete_timestamp IS NULL AND ss2.occurrence_submission_id = os2.occurrence_submission_id AND sst.submission_status_type_id = ss2.submission_status_type_id AND sst.name::text = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED'::character varying)::text AND sst.record_end_date IS NULL))
        GROUP BY os.survey_id
      ), published AS (
       SELECT os.survey_id,
          max(ss.submission_status_id) AS submission_status_id
         FROM occurrence_submission os,
          submission_status ss,
          submission_status_type sst
        WHERE ss.submission_status_type_id = sst.submission_status_type_id AND sst.name::text = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED'::character varying)::text AND sst.record_end_date IS NULL AND os.delete_timestamp IS NULL
        GROUP BY os.survey_id
      )
    SELECT s.project_id,
       np.survey_id,
       ss3.occurrence_submission_id,
       sst.name AS survey_status,
       ss3.event_timestamp AS status_event_timestamp
      FROM not_published np,
       submission_status ss3,
       submission_status_type sst,
       survey s
     WHERE ss3.submission_status_id = np.submission_status_id AND sst.submission_status_type_id = ss3.submission_status_type_id AND s.survey_id = np.survey_id
   UNION
    SELECT s.project_id,
       p.survey_id,
       ss3.occurrence_submission_id,
       sst.name AS survey_status,
       ss3.event_timestamp AS status_event_timestamp
      FROM published p,
       submission_status ss3,
       submission_status_type sst,
       survey s
     WHERE ss3.submission_status_id = p.submission_status_id AND sst.submission_status_type_id = ss3.submission_status_type_id AND s.survey_id = p.survey_id;

  SET search_path = ${DB_SCHEMA_DAPI_V1};

  create view survey_status as select * from ${DB_SCHEMA}.survey_status;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
