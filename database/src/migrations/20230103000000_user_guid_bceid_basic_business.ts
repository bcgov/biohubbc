import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Change 'BCEID' to 'BCEIDBASIC'
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  // Update BCeID record to reflect BCeID Basic
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA}, ${DB_SCHEMA_DAPI_V1};

    UPDATE
      user_identity_source
    SET
      name = 'BCEIDBASIC',
      description = 'BCEID BASIC user source system.'
    WHERE
      user_identity_source_id = (
        SELECT
          user_identity_source_id
        FROM
          user_identity_source
        WHERE
          name LIKE 'BCEID'
      );
  `);

  // Add a record for BCeID Business identity source
  await knex.raw(`
    INSERT INTO
      user_identity_source
      ("name", record_effective_date, description, create_date, create_user)
    VALUES
      ('BCEIDBUSINESS', now(), 'BCEID BUSINESS user source system.', now(), 1);
  `);

  // Add the new user GUID column to the system users table with a default value
  await knex.raw(`
    ALTER TABLE
      "system_user"
    ADD
      user_guid varchar(200) NOT NULL
    DEFAULT
      'default_guid';
  `);

  // Update default GUIDs
  await knex.raw(`
    UPDATE system_user SET user_guid = 'postgres' WHERE user_identifier LIKE 'postgres';
    UPDATE system_user SET user_guid = 'biohub_api' WHERE user_identifier LIKE 'biohub_api';
  `);

  await knex.raw(`
    COMMENT ON COLUMN
      "system_user".user_guid
    IS
      'The GUID of the user.';
  `);

  // Drop the default value for GUIDs
  await knex.raw(`
    ALTER TABLE
      system_user
    ALTER COLUMN
      user_guid
    DROP DEFAULT;
  `);

  // Update the user context script to use the user's GUID
  await knex.raw(`
    drop function if exists api_set_context;

    create or replace function api_set_context(p_system_user_guid system_user.user_guid%type, p_user_identity_source_name user_identity_source.name%type) returns system_user.system_user_id%type
    language plpgsql
    security invoker
    set client_min_messages = warning
    as
    $$
    -- *******************************************************************
    -- Procedure: api_set_context
    -- Purpose: sets the initial context for api users
    --
    -- MODIFICATION HISTORY
    -- Person           Date        Comments
    -- ---------------- ----------- --------------------------------------
    -- charlie.garrettjones@quartech.com
    --                  2021-01-03  initial release
    --                  2021-04-16  adjusted to accepted defined user identity source
    -- roland.stens@gov.bc.ca
    --                  2021-07-15  Added security related updates and additions
    -- charlie.garrettjones@quartech.com
    --                  2022-12-20  removed security concepts
    -- curtis.upshall@quartech.com
    --                  2023-01-04  updated identifier to reflect user GUID instead of
                        user identifier
    -- *******************************************************************
    declare
      _system_user_id system_user.system_user_id%type;
      _user_identity_source_id user_identity_source.user_identity_source_id%type;
    begin

      select user_identity_source_id into strict _user_identity_source_id from user_identity_source
        where name = p_user_identity_source_name
        and record_end_date is null;

      select system_user_id into strict _system_user_id from system_user
        where user_identity_source_id = _user_identity_source_id
        and user_guid = p_system_user_guid;

      create temp table if not exists biohub_context_temp (tag varchar(200), value varchar(200));
      delete from biohub_context_temp where tag = 'user_id';
      insert into biohub_context_temp (tag, value) values ('user_id', _system_user_id::varchar(200));

      return _system_user_id;
    exception
      when others THEN
        raise;
    end;
    $$;
  `);
}

/**
 * Not used.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}