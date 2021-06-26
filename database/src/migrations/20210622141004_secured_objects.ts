import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  ALTER TABLE ${DB_SCHEMA}.webform_draft ENABLE ROW LEVEL SECURITY;

  CREATE POLICY only_owner
      ON ${DB_SCHEMA}.webform_draft
      AS PERMISSIVE
      FOR ALL
      TO ${DB_SCHEMA}_api
      USING ((su_id = ${DB_SCHEMA}.api_get_context_user_id()));

  ALTER TABLE ${DB_SCHEMA}.project_attachment ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
      ON ${DB_SCHEMA}.project_attachment
      AS PERMISSIVE
      FOR ALL
      TO public
      USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  ALTER TABLE ${DB_SCHEMA}.project ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
    ON ${DB_SCHEMA}.project
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  ALTER TABLE ${DB_SCHEMA}.survey ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
    ON ${DB_SCHEMA}.survey
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  ALTER TABLE ${DB_SCHEMA}.survey_attachment ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
    ON ${DB_SCHEMA}.survey_attachment
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  ALTER TABLE ${DB_SCHEMA}.occurrence ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
    ON ${DB_SCHEMA}.occurrence
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  ALTER TABLE ${DB_SCHEMA}.webform_draft DISABLE ROW LEVEL SECURITY;

  DROP POLICY only_owner ON ${DB_SCHEMA}.webform_draft;
  DROP POLICY security_check ON ${DB_SCHEMA}.webform_draft;

  DROP POLICY security_check ON ${DB_SCHEMA}.project_attachment;
  ALTER TABLE ${DB_SCHEMA}.project_attachment DISABLE ROW LEVEL SECURITY;

  DROP POLICY security_check ON ${DB_SCHEMA}.project;
  ALTER TABLE ${DB_SCHEMA}.project DISABLE ROW LEVEL SECURITY;

  DROP POLICY security_check ON ${DB_SCHEMA}.survey;
  ALTER TABLE ${DB_SCHEMA}.survey DISABLE ROW LEVEL SECURITY;

  DROP POLICY security_check ON ${DB_SCHEMA}.survey_attachment;
  ALTER TABLE ${DB_SCHEMA}.survey_attachment DISABLE ROW LEVEL SECURITY;

  DROP POLICY security_check ON ${DB_SCHEMA}.occurrence;
  ALTER TABLE ${DB_SCHEMA}.occurrence DISABLE ROW LEVEL SECURITY;

  `);
}
