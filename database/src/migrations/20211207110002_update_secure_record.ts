import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  CREATE OR REPLACE FUNCTION ${DB_SCHEMA}.api_apply_security_rule(
    __security_rule_id integer)
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
          v_system_user_id character varying;
          v_rule_definition character varying;
          v_target character varying;
          v_project_id character varying;
          begin
          -- Delete all security references in the security table as this might be an update
          delete from ${DB_SCHEMA}.security where security_rule_id = __security_rule_id;

          --- Iterate over all the securable objects and apply security
          <<outer>>
        FOR v_target, v_rule_definition, v_project_id IN
          SELECT rd->>'target', rd->>'rule', CASE WHEN rd->>'project'='' THEN NULL ELSE rd->>'project' END
          FROM biohub.security_rule, json_array_elements(rule_definition) AS rd
          where security_rule_id = __security_rule_id and system_rule = false and
          (record_end_date <= now()::date or record_end_date is NULL) and
          (record_effective_date >= now()::date)
        LOOP

          IF v_project_id is NULL THEN
             v_project_id = 'NULL';
          END IF;

          -- Execute the query to find the records that need to be secured
          execute format('select ${DB_SCHEMA}.api_secure_record(%1$s_id, ''%1$s'', %2$s, %3$s, %5$s) from biohub.%1$s where %4$s', v_target, __security_rule_id, 'NULL', v_rule_definition,v_project_id);

          <<inner>>
          FOR v_system_user_id IN
          SELECT user_data FROM ${DB_SCHEMA}.security_rule, json_array_elements(users) AS user_data
          where security_rule_id =__security_rule_id and users is NOT NULL and system_rule = false and
          (record_end_date <= now()::date or record_end_date is NULL) and
          (record_effective_date >= now()::date)
          LOOP
            -- Execute the query to set the exception for identified users
            execute format('select ${DB_SCHEMA}.api_secure_record(%1$s_id, ''%1$s'', %2$s, %3$s, %5$s) from biohub.%1$s where %4$s', v_target, __security_rule_id, v_system_user_id, v_rule_definition,v_project_id);
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
      __security_rule_id integer,
      __system_user_id integer,
      __project_id integer)
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
    -- roland.stens@gov.bc.ca
    --                  2021-12-07  Update to deal with NULL project_id
    -- *******************************************************************
    declare
      v_security_token uuid;
    begin
    -- If we have an existing token for the record, do not generate a new one
    execute format('select security_token from ${DB_SCHEMA}.%1$s where %1$s_id = %2$s', __table_name, __id) into v_security_token;

    -- If there is no security_token yet, generate one and update the record
    if (v_security_token IS NULL) then
      v_security_token = public.gen_random_uuid();
      execute format('update ${DB_SCHEMA}.%1$s set security_token = ''%2$s'' where %1$s_id = %3$s', __table_name, v_security_token, __id);
    end if;

    -- Create a new entry in the security table
    if (__project_id IS NULL) then
      insert into ${DB_SCHEMA}.security(system_user_id,security_rule_id,security_token,project_id,create_date) values(__system_user_id,__security_rule_id,v_security_token,NULL,now());
    else
      insert into ${DB_SCHEMA}.security(system_user_id,security_rule_id,security_token,project_id,create_date) values(__system_user_id,__security_rule_id,v_security_token,__project_id,now());
    end if;

    return true;
    end;
  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.api_secure_record(integer, character varying, integer, integer, integer)
      OWNER TO postgres;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;
  DROP FUNCTION ${DB_SCHEMA}.api_secure_record(integer, character varying, integer, integer,integer);
  `);
}
