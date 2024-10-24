import { Knex } from 'knex';

/**
 * Add/update function that patches a system user record.
 *
 * Steps:
 * 1. Attempts to find an existing system user record
 *    - First using `p_system_user_guid`
 *    - Second using `p_user_identifier` and `p_user_identity_source_name`
 * 2. If no user is found, return null
 * 3. If a user is found, update the system user record with the latest information passed to this function if any of
 * the incoming values are not the same as the existing values (if all incoming values are the same as the existing then
 * no update is performed).
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    set search_path = 'biohub';

    CREATE OR REPLACE FUNCTION
      biohub.api_patch_system_user (
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
        DECLARE
          _system_user system_user%rowtype;
        BEGIN
          -- Attempt to find user based on guid
          SELECT * INTO _system_user FROM system_user
            WHERE LOWER(user_guid) = LOWER(p_system_user_guid)
            AND record_end_date IS NULL
            LIMIT 1;

          -- Otherwise, attempt to find user based on identifier and identity source
          IF NOT found THEN
            SELECT * INTO _system_user FROM system_user
            WHERE user_identity_source_id = (
              SELECT user_identity_source_id FROM user_identity_source
              WHERE LOWER(name) = LOWER(p_user_identity_source_name)
              AND record_end_date IS NULL
            )
            AND LOWER(user_identifier) = LOWER(p_user_identifier)
            AND record_end_date IS NULL
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
            user_guid IS DISTINCT FROM p_system_user_guid OR
            user_identifier IS DISTINCT FROM p_user_identifier OR
            email IS DISTINCT FROM p_email OR
            display_name IS DISTINCT FROM p_display_name OR
            given_name IS DISTINCT FROM p_given_name OR
            family_name IS DISTINCT FROM p_family_name OR
            agency IS DISTINCT FROM p_agency
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
