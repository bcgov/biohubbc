import { Knex } from 'knex';

/**
 * New table:
 * - alert
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create new table
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE alert (
      alert_id           integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      type               varchar(100)       NOT NULL,
      name               varchar(100)       NOT NULL,
      message            varchar(250)       NOT NULL,
      data               json,
      record_end_date    date,
      create_date        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user        integer            NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT alert_pk PRIMARY KEY (alert_id)
    );

    COMMENT ON TABLE  alert                    IS 'Alert records about various topics (i.e. bad data, system news, etc).';
    COMMENT ON COLUMN alert.alert_id           IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN alert.type               IS 'The type of the alert. Used to categorize/group alerts by type.';
    COMMENT ON COLUMN alert.name               IS 'The name of the alert.';
    COMMENT ON COLUMN alert.message            IS 'The message of the alert.';
    COMMENT ON COLUMN alert.data               IS 'The data of the alert. Should ideally align with the type of the alert.';
    COMMENT ON COLUMN alert.record_end_date    IS 'Record level end date.';
    COMMENT ON COLUMN alert.create_date        IS 'The datetime the record was created.';
    COMMENT ON COLUMN alert.create_user        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN alert.update_date        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN alert.update_user        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN alert.revision_count     IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_alert BEFORE INSERT OR UPDATE OR DELETE ON biohub.alert FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_alert AFTER INSERT OR UPDATE OR DELETE ON biohub.alert FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW alert AS SELECT * FROM biohub.alert;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
