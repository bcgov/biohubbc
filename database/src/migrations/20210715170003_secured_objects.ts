import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  -- Is here for testing pupose will need to be reset to regular.
  --alter table ${DB_SCHEMA}.webform_draft add column security_token UUID;
  ALTER TABLE ${DB_SCHEMA}.webform_draft ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
      ON ${DB_SCHEMA}.webform_draft
      AS PERMISSIVE
      FOR ALL
      TO public
      USING ((${DB_SCHEMA}.api_security_check(security_token,system_user_id) = true));

  alter table ${DB_SCHEMA}.occurrence add column security_token UUID;
  ALTER TABLE ${DB_SCHEMA}.occurrence ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
    ON ${DB_SCHEMA}.occurrence
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  --alter table ${DB_SCHEMA}.survey_attachment add column security_token UUID;
  ALTER TABLE ${DB_SCHEMA}.survey_attachment ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
      ON ${DB_SCHEMA}.survey_attachment
      AS PERMISSIVE
      FOR ALL
      TO public
      USING ((${DB_SCHEMA}.api_security_check(security_token,create_user) = true));

  --alter table ${DB_SCHEMA}.project_attachment add column security_token UUID;
  ALTER TABLE ${DB_SCHEMA}.project_attachment ENABLE ROW LEVEL SECURITY;
  CREATE POLICY security_check
      ON ${DB_SCHEMA}.project_attachment
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
  DROP POLICY security_check ON ${DB_SCHEMA}.webform_draft;
  alter table ${DB_SCHEMA}.webform_draft remove column security_token;

  DROP POLICY security_check ON ${DB_SCHEMA}.occurrence;
  ALTER TABLE ${DB_SCHEMA}.occurrence DISABLE ROW LEVEL SECURITY;
  alter table ${DB_SCHEMA}.occurrence remove column security_token;

  `);
}
