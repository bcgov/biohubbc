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
    v_record_id integer;
    v_project_id integer;
  begin
    -- Find the value for the primary key column
    SELECT "1" into v_record_id FROM (SELECT NEW.*) as t("1");

    CASE upper(TG_TABLE_NAME)
      WHEN 'PROJECT_ATTACHMENT', 'PROJECT_REPORT_ATTACHMENT' THEN
        execute format('select project_id from ${DB_SCHEMA}.%1$s where %1$s_id = %2$s',TG_TABLE_NAME,v_record_id) into v_project_id;
      ELSE
        execute format('select a.project_id from ${DB_SCHEMA}.survey a, ${DB_SCHEMA}.%1$s b where a.survey_id = b.survey_id and b.%1$s_id = %2$s',TG_TABLE_NAME,v_record_id) into v_project_id;
    END CASE;

    -- Secure the record
    execute format('select ${DB_SCHEMA}.api_secure_attachment_record(%1$s,lower(''%2$s''),%3$s)',v_record_id,TG_TABLE_NAME,v_project_id);

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
