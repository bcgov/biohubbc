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