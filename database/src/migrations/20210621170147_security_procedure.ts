import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_set_context(
    _system_user_identifier character varying,
    _user_identity_source_name character varying)
      RETURNS integer
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL UNSAFE
      SET client_min_messages='warning'
  AS $BODY$
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
  -- *******************************************************************
  declare
    v_user_id ${DB_SCHEMA}.system_user.id%type;
    v_system_role_id ${DB_SCHEMA}.system_role.id%type;
  begin

    select b.id, c.sr_id into v_user_id, v_system_role_id from ${DB_SCHEMA}.system_user b, ${DB_SCHEMA}.system_user_role c
      where uis_id = (select a.id from ${DB_SCHEMA}.user_identity_source a
    where a.name = _user_identity_source_name and a.record_end_date is null)
      and b.user_identifier = _system_user_identifier and
      c.su_id = b.id;

    create temp table if not exists ${DB_SCHEMA}_context_temp (tag varchar(200), value varchar(200));
    delete from ${DB_SCHEMA}_context_temp where tag in ('user_id','system_user_role_id');
    insert into ${DB_SCHEMA}_context_temp (tag, value) values ('user_id', v_user_id::varchar(200)),
      ('system_user_role_id', v_system_role_id::varchar(200));

    return v_user_id;
  exception
    when others THEN
      raise;
  end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_set_context(character varying, character varying)
      OWNER TO postgres;

  GRANT EXECUTE ON FUNCTION ${DB_SCHEMA}.api_set_context(character varying, character varying) TO PUBLIC;

  GRANT EXECUTE ON FUNCTION ${DB_SCHEMA}.api_set_context(character varying, character varying) TO ${DB_SCHEMA}_api;

  GRANT EXECUTE ON FUNCTION ${DB_SCHEMA}.api_set_context(character varying, character varying) TO postgres;



  --- Security Check, will find out if the record can be accessed by the calling user
  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_security_check(__security_token security.security_token%type, __create_user_id system_user.id%type)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL UNSAFE
  AS $BODY$
  -- *******************************************************************
  -- Procedure: api_security_check
  -- Purpose: returns a boolean indicating if the record can be used
  -- or not
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- roland.stens@gov.bc.ca
  --                  2021-06-22  initial release
  -- *******************************************************************
  declare
    v_admin_count integer;
    v_user_access integer;
  begin
    -- Is this a public record? (there will be no security token)
      if (__security_token IS NULL) then
          return true;
      end if;

    -- Is the user a sys/data admin?
      select count(*)::integer into v_admin_count from ${DB_SCHEMA}.system_user_role where su_id = ${DB_SCHEMA}.api_get_context_user_id() and sr_id in (1,2);
      if (v_admin_count > 0) then
          return true;
      end if;

    -- Has the user created this record?
      if (__create_user_id = ${DB_SCHEMA}.api_get_context_user_id()) then
        return true;
      end if;

    -- Is the user part of the project?

    -- Has the user been given specific access to this record?
    select count(*)::integer into v_user_access from ${DB_SCHEMA}.security where su_id = ${DB_SCHEMA}.api_get_context_user_id() and security_token = __security_token;
    if (v_user_access > 0) then
      return true;
    end if;

    -- If all fails then there is no access to the record.
    return false;

  end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_security_check(uuid, integer)
      OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_secure_record(
    __id integer,
    __table_name character varying,
    __sec_rule_id integer,
    __su_id integer)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL SAFE
  AS $BODY$
  -- *******************************************************************
      -- Procedure: api_secure_record
      -- Purpose: Secures the record in the table and creates an entry
      -- in the security table
      --
      -- MODIFICATION HISTORY
      -- Person           Date        Comments
      -- ---------------- ----------- --------------------------------------
      -- roland.stens@gov.bc.ca
      --                  2021-06-24  initial release
      -- *******************************************************************
      declare
        v_security_token uuid;
      sql text;
      begin
      -- If we have an existing token for the record, do not generate a new one
      execute format('select security_token from ${DB_SCHEMA}.%1$s where id = %2$s', __table_name, __id) into v_security_token;

      -- If there is no security_token yet, generate one and update the record
      if (v_security_token IS NULL) then
        v_security_token = public.gen_random_uuid();
        execute format('update ${DB_SCHEMA}.%1$s set security_token = ''%2$s'' where id = %3$s', __table_name, v_security_token, __id);
      end if;

      -- Create a new entry in the security table
      insert into ${DB_SCHEMA}.security(su_id, secr_id,security_token,create_date) values(__su_id,__sec_rule_id,v_security_token,now());

      return true;
      end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_secure_record(integer, character varying, integer, integer)
      OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_apply_security_rule(
    __sec_rule_id integer)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL SAFE
  AS $BODY$
  -- *******************************************************************
      -- Procedure: api_apply_security_rule
      -- Purpose: Applies the security rules to the records, set the
      -- security token in the record and in the security table
      --
      -- MODIFICATION HISTORY
      -- Person           Date        Comments
      -- ---------------- ----------- --------------------------------------
      -- roland.stens@gov.bc.ca
      --                  2021-06-25  initial release
      -- *******************************************************************
      declare
      TABLE_RECORD RECORD;
      v_su_id character varying;
      v_rule_definition character varying;
      v_table character varying;
      v_record_id integer;
      v_sql_stmnt text;
      begin
      -- Delete all security references in the security tables as this might be an update
      delete from ${DB_SCHEMA}.security where secr_id = __sec_rule_id;

      -- Get the parameters needed for calling the api_secure_record function
      select su_id::varchar, rule_definition, target into v_su_id, v_rule_definition, v_table from ${DB_SCHEMA}.security_rule where id = __sec_rule_id;

      -- In case of an empty su_id set the string to NULL, otherwise the next statement will fail.
      if v_su_id is NULL then
        v_su_id = 'NULL';
      end if;

      -- Execute the query to find the records that need to be secured
      execute format('select ${DB_SCHEMA}.api_secure_record(id, ''%1$s'', %2$s, %3$s) from ${DB_SCHEMA}.%1$s where %4$s', v_table, __sec_rule_id, v_su_id, v_rule_definition);

      return true;
      end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_apply_security_rule(integer)
      OWNER TO postgres;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;
  DROP FUNCTION ${DB_SCHEMA}.api_security_check(uuid, integer);
  DROP FUNCTION ${DB_SCHEMA}.api_set_context(character varying, character varying);
  DROP FUNCTION ${DB_SCHEMA}.api_secure_record(integer, character varying, integer, integer);
  DROP FUNCTION ${DB_SCHEMA}.api_apply_security_rule(integer);

  `);
}
