import { Knex } from 'knex';

/**
 * Add/update function to set the context for the user making a database request. Used by the auditing and journaling
 * triggers.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET search_path = 'biohub';

    DROP FUNCTION IF EXISTS api_set_context;

    CREATE OR REPLACE FUNCTION api_set_context(p_system_user_guid system_user.user_guid%type, p_user_identity_source_name user_identity_source.name%type) RETURNS system_user.system_user_id%type
    language plpgsql
    security invoker
    SET client_min_messages = warning
    AS
    $$
      DECLARE
        _system_user_id system_user.system_user_id%type;
        _user_identity_source_id user_identity_source.user_identity_source_id%type;
      BEGIN
        SELECT user_identity_source_id INTO strict _user_identity_source_id FROM user_identity_source
          WHERE LOWER(name) = LOWER(p_user_identity_source_name)
          AND record_end_date IS NULL;

        SELECT system_user_id INTO strict _system_user_id FROM system_user
          WHERE user_identity_source_id = _user_identity_source_id
          AND LOWER(user_guid) = LOWER(p_system_user_guid);

        CREATE TEMP TABLE IF NOT EXISTS biohub_context_temp (tag varchar(200), value varchar(200));
        DELETE FROM biohub_context_temp WHERE tag = 'user_id';
        INSERT INTO biohub_context_temp (tag, value) values ('user_id', _system_user_id::varchar(200));

        RETURN _system_user_id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE;
      END;
    $$;
  `);
}
