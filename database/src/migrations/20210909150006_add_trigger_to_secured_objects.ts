import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  CREATE FUNCTION ${DB_SCHEMA}.tr_secure_record_trigger()
      RETURNS trigger
      LANGUAGE 'plpgsql'
      COST 100
      VOLATILE NOT LEAKPROOF
      SET client_min_messages='warning'
  AS $BODY$
  -- *******************************************************************
  -- Procedure: tr_secure_record_trigger
  -- Purpose: Secures the record when created, uses system security rule.
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- roland.stens@gov.bc.ca
  --                  2021-09-09  initial release
  -- *******************************************************************
  declare
    v_security_rule_id integer;
    v_identity_column character varying;
    v_record_id integer;
  begin
    -- Find the right entry in the security rules table for the system rule related to the table
    execute format('select security_rule_id from ${DB_SCHEMA}.security_rule where rule_definition ->> ''target'' = lower(''%1$s'') and system_rule=true', TG_TABLE_NAME) into v_security_rule_id;

    SELECT "1" into v_record_id FROM (SELECT NEW.*) as t("1");

    -- Secure the record
    execute format('select ${DB_SCHEMA}.api_secure_record( %3$s, lower(''%1$s''), %2$s, ${DB_SCHEMA}.api_get_context_user_id())',TG_TABLE_NAME, v_security_rule_id,v_record_id);

   -- todo
   -- if NEW.project_id then
   --   update ${DB_SCHEMA}.security set project_id = NEW.project_id where security_token = NEW.security_token;
   -- end if;

    return NEW;
  end;

  $BODY$;

  ALTER FUNCTION ${DB_SCHEMA}.tr_secure_record_trigger()
      OWNER TO postgres;

  CREATE TRIGGER secure_record
      AFTER INSERT
      ON ${DB_SCHEMA}.project_attachment
      FOR EACH ROW
      EXECUTE PROCEDURE ${DB_SCHEMA}.tr_secure_record_trigger();

  CREATE TRIGGER secure_record
      AFTER INSERT
      ON ${DB_SCHEMA}.project_report_attachment
      FOR EACH ROW
      EXECUTE PROCEDURE ${DB_SCHEMA}.tr_secure_record_trigger();

      CREATE TRIGGER secure_record
      AFTER INSERT
      ON ${DB_SCHEMA}.survey_attachment
      FOR EACH ROW
      EXECUTE PROCEDURE ${DB_SCHEMA}.tr_secure_record_trigger();
      
      CREATE TRIGGER secure_record
      AFTER INSERT
      ON ${DB_SCHEMA}.survey_report_attachment
      FOR EACH ROW
      EXECUTE PROCEDURE ${DB_SCHEMA}.tr_secure_record_trigger();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
