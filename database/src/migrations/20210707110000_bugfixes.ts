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
  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_security_check(
    __security_token uuid,
    __create_user_id integer)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      STABLE PARALLEL UNSAFE
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
      v_admin integer;
      v_user_access integer;
    v_user_id integer;
    begin
      -- Is this a public record$1 (there will be no security token)
        if (__security_token IS NULL) then
            return true;
        end if;

      -- Is the user a sys admin$2
        select ${DB_SCHEMA}.api_get_context_system_user_role_id()::integer into v_admin;
        if (v_admin = 1) then
            return true;
        end if;

      -- Has the user created this record$3
      select ${DB_SCHEMA}.api_get_context_user_id()::integer into v_user_id;
        if (__create_user_id = v_user_id) then
          return true;
        end if;

      -- Is the user a project admin$4
      if (v_admin = 2) then
          return true;
      end if;

      -- Has the user been given specific access to this record$5
      select count(*)::integer into v_user_access from ${DB_SCHEMA}.security where su_id = v_user_id and security_token = __security_token;
      if (v_user_access > 0) then
        return true;
      end if;

      -- If all fails then there is no access to the record.
      return false;

    end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_security_check(uuid, integer)
      OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_apply_security_rule(
    __sec_rule_id integer)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      VOLATILE PARALLEL UNSAFE
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
          v_su_id character varying;
          v_rule_definition character varying;
          v_target character varying;
          begin
          -- Delete all security references in the security table as this might be an update
          delete from ${DB_SCHEMA}.security where secr_id = __sec_rule_id;

          --- Iterate over all the securable objects and apply security
          <<outer>>
        FOR v_target, v_rule_definition IN
              SELECT trim('"' FROM cast(data->'target' as text)), trim('"' FROM cast(data->'rule' as text))
          FROM ${DB_SCHEMA}.security_rule, json_array_elements(rule_definition) AS data
          where id = __sec_rule_id and system_rule = false and
          (end_date <= now()::date or end_date is NULL) and
          (start_date >= now()::date)
        LOOP
          -- Execute the query to find the records that need to be secured
          execute format('select ${DB_SCHEMA}.api_secure_record(id, ''%1$s'', %2$s, %3$s) from ${DB_SCHEMA}.%1$s where %4$s', v_target, __sec_rule_id, 'NULL', v_rule_definition);

          <<inner>>
          FOR v_su_id IN
          SELECT user_data FROM ${DB_SCHEMA}.security_rule, json_array_elements(users) AS user_data
          where id =__sec_rule_id and users is NOT NULL and system_rule = false and
          (end_date <= now()::date or end_date is NULL) and
          (start_date >= now()::date)
          LOOP
            -- Execute the query to set the exception for identified users
            execute format('select ${DB_SCHEMA}.api_secure_record(id, ''%1$s'', %2$s, %3$s) from ${DB_SCHEMA}.%1$s where %4$s', v_target, __sec_rule_id, v_su_id, v_rule_definition);
          END LOOP inner;

          END LOOP outer;

          return true;
          end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_apply_security_rule(integer)
      OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_secure_record(
    __id integer,
    __table_name character varying,
    __sec_rule_id integer,
    __su_id integer)
      RETURNS boolean
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL UNSAFE
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

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_get_context_user_id(
    )
      RETURNS integer
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE PARALLEL UNSAFE
  AS $BODY$
  -- *******************************************************************
  -- Procedure: api_get_context_user_id
  -- Purpose: returns the context user id from the invokers temp table
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- charlie.garrettjones@quartech.com
  --                  2021-01-03  initial release
  -- *******************************************************************
  declare
    v_user_id ${DB_SCHEMA}.system_user.id%type;
  begin
    select value::integer into v_user_id from biohub_context_temp where tag = 'user_id';

    return v_user_id;
  end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_get_context_user_id()
      OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_get_context_system_user_role_id(
    )
      RETURNS integer
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE
  AS $BODY$
  -- *******************************************************************
  -- Procedure: api_get_context_system_user_role_id
  -- Purpose: returns the context system user role id from the invokers
  -- temp table
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- roland.stens@gov.bc.ca
  --                  2021-06-03  initial release
  -- *******************************************************************
  declare
    v_system_role_id ${DB_SCHEMA}.system_user_role.sr_id%type;
  begin
    select value::integer into v_system_role_id from biohub_context_temp where tag = 'system_user_role_id';

    return v_system_role_id;
  end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_get_context_system_user_role_id()
    OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_security_maintenance(
    )
      RETURNS void
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE
  AS $BODY$
  -- *******************************************************************
  -- Procedure: api_security_maintenance
  -- Purpose: maintains and cleanses the security settings,
  -- making sure that all is proper
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- roland.stens@gov.bc.ca
  --                  2021-07-08  initial release
  -- *******************************************************************
  declare
    v_table_name text;
  begin
    -- Delete security table entries that are no longer connected to a security rule
    delete FROM ${DB_SCHEMA}.security where secr_id not in (select id from ${DB_SCHEMA}.security_rule);

    FOR v_table_name IN
      select t.table_name from information_schema.tables t
        inner join information_schema.columns c on c.table_name = t.table_name and c.table_schema = t.table_schema
        where c.column_name = 'security_token'
              and t.table_schema = 'biohub'
              and t.table_type = 'BASE TABLE'
            and t.table_name <> 'security'
        order by t.table_name
    LOOP
      -- Update security_tokens set to null when there are no related entries in the security table anymore
      execute format('update ${DB_SCHEMA}.%1$s a set security_token = null where  a.security_token IS NOT NULL and a.security_token not in
					   (select distinct security_token from ${DB_SCHEMA}.security order by 1)',v_table_name);

    END LOOP;
  end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_security_maintenance()
    OWNER TO postgres;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_security_rules_bulk_apply(
      )
        RETURNS VOID
        LANGUAGE 'plpgsql'
        COST 100
        STABLE PARALLEL UNSAFE
    AS $BODY$
    -- *******************************************************************
    -- Procedure: api_security_rules_bulk_apply
    -- Purpose: Applies all the security rules and makes sure everything
    -- is clean and connected (not orphan references)
    --
    -- MODIFICATION HISTORY
    -- Person           Date        Comments
    -- ---------------- ----------- --------------------------------------
    -- roland.stens@gov.bc.ca
    --                  2021-07-08  initial release
    -- *******************************************************************
    declare

    begin
      perform ${DB_SCHEMA}.api_apply_security_rule(id) from ${DB_SCHEMA}.security_rule;
      perform ${DB_SCHEMA}.api_security_maintenance();
    end;
    $BODY$;

    ALTER FUNCTION ${DB_SCHEMA}.api_security_rules_bulk_apply()
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
  DROP FUNCTION ${DB_SCHEMA}.api_get_context_user_id();
  DROP FUNCTION ${DB_SCHEMA}.api_get_context_system_user_role_id();
  `);
}
