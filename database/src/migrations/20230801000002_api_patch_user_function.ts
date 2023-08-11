import { Knex } from 'knex';

/**
 * Add function that patches a system user record.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    set search_path=biohub;

    CREATE OR REPLACE FUNCTION
      api_patch_system_user (
        p_system_user_guid character varying,
        p_user_identifier character varying,
        p_user_identity_source_name character varying,
        p_email character varying,
        p_display_name character varying,
        p_given_name character varying,
        p_family_name character varying,
        p_agency character varying
      )
      RETURNS integer
      LANGUAGE plpgsql
      SET client_min_messages TO 'warning'
      AS $$
        -- *******************************************************************
        -- Procedure: api_patch_system_user
        -- Purpose: Updates a system_user record if any of the incoming values are not the same as the existing values.
        --
        -- MODIFICATION HISTORY
        -- Person           Date        Comments
        -- ---------------- ----------- --------------------------------------
        -- nick.phura@quartech.com
        --                  2023-08-01  initial release
        -- *******************************************************************
        DECLARE
          _system_user system_user%rowtype;
          _user_identity_source_id user_identity_source.user_identity_source_id%type;
        BEGIN
          -- Attempt to find user based on guid
          SELECT * INTO _system_user FROM system_user
            WHERE user_guid = p_system_user_guid
            AND record_end_date IS NULL
            LIMIT 1;

          -- Otherwise, attempt to find user based on identifier and identity source
          IF NOT found THEN
            SELECT user_identity_source_id INTO strict _user_identity_source_id FROM user_identity_source
              WHERE name = p_user_identity_source_name
              AND record_end_date IS NULL;

            SELECT * INTO _system_user FROM system_user
              WHERE user_identity_source_id = _user_identity_source_id
              AND user_identifier = p_user_identifier
              LIMIT 1;
          END IF;

          -- If no user found, return and do nothing
          IF NOT found THEN
            RETURN NULL;
          END IF;

          -- Otherwise, patch the system user record with the latest information passed to this function
          UPDATE system_user SET
            user_guid = p_system_user_guid,
            user_identifier = p_user_identifier,
            email = p_email,
            display_name = p_display_name,
            given_name = p_given_name,
            family_name = p_family_name,
            agency = p_agency
          WHERE
            system_user_id = _system_user.system_user_id
          AND (
            user_guid != p_system_user_guid OR
            user_identifier != p_user_identifier OR
            email != p_email OR
            display_name != p_display_name OR
            given_name != p_given_name OR
            family_name != p_family_name OR
            agency != p_agency
          );

          -- Return system user id of patched record
          RETURN _system_user.system_user_id;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE;
        END;
      $$;

    COMMENT ON FUNCTION api_patch_system_user(varchar, varchar, varchar, varchar, varchar, varchar, varchar, varchar) IS 'Updates a system_user record if any of the incoming values are not the same as the existing values.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
