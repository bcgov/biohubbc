import * as Knex from "knex";
const DB_SCHEMA = process.env.DB_SCHEMA || 'biohubbc';


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA};
  
      CREATE TABLE session_log(
        id            integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        session_id    integer          NOT NULL,
        create_at     timestamp(6)     NOT NULL,
        message       varchar(2000)    NOT NULL,
        CONSTRAINT pk103_1 PRIMARY KEY (id)
    )
    ;
    
    COMMENT ON COLUMN ${DB_SCHEMA}.session_log.id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN ${DB_SCHEMA}.session_log.session_id IS 'The id of the database session.';
    ALTER TABLE ${DB_SCHEMA}.session_log OWNER TO ${DB_SCHEMA};
    `);
  }
  
  /**
   * Drop the `session_log` table.
   *
   * @export
   * @param {Knex} knex
   * @return {*}  {Promise<void>}
   */
  export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
      set schema '${DB_SCHEMA}';
      set search_path = ${DB_SCHEMA};
  
      DROP TABLE IF EXISTS ${DB_SCHEMA}.session_log;
    `);
  }
  
