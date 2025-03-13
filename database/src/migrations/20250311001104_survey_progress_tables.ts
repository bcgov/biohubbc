import { Knex } from 'knex';

/**
 * New table:
 * - survey_progress
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql

        ----------------------------------------------------------------------------------------
    -- Create tables for survey_checklist to map checklists to survey_ids from survey
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub;

    CREATE TABLE survey_checklist (
      survey_checklist_id integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id          varchar(100)       NOT NULL,
      checklist_id       varchar(100)       NOT NULL,
      record_end_date    date,
      create_date        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user        integer            NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_checklist_pk PRIMARY KEY (survey_checklist checklist_id)
    );

    COMMENT ON TABLE  survey_checklist                    IS 'Maps checklist_id to survey_id .';
    COMMENT ON COLUMN survey_checklist.survey.id          IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_checklist.checklist.id       IS 'The id of the checklist.';
    COMMENT ON COLUMN survey_checklist.record_end_date    IS 'Record level end date.';
    COMMENT ON COLUMN survey_checklist.create_date        IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_checklist.create_user        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_checklist.update_date        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_checklist.update_user        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_checklist.revision_count     IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create tables for checklist
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist (
      checklist_id      integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name               varchar(100)       NOT NULL,
      description        varchar(100)       NOT NULL,
      record_end_date    date,
      create_date        timestamptz(6)     DEFAULT now() NOT NULL,
      create_user        integer            NOT NULL,
      update_date        timestamptz(6),
      update_user        integer,
      revision_count     integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_pk PRIMARY KEY (checklist_id)
    );

    COMMENT ON TABLE  checklist                     IS 'Stores checklists and maps .';
    COMMENT ON COLUMN checklist.checklist.id        IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist.name                IS 'The name of the checklist.';
    COMMENT ON COLUMN checklist.description        IS 'The description of the checklist and its intended use case.';
    COMMENT ON COLUMN checklist.record_end_date    IS 'Record level end date.';
    COMMENT ON COLUMN checklist.create_date        IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist.create_user        IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist.update_date        IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist.update_user        IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist.revision_count     IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Create new table for checklist_definition
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_definition (
      checklist_definition_id   integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      checklist_id              integer            NOT NULL,
      checklist_ item_id        varchar(50)        NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user               integer            NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_definition_pk PRIMARY KEY (checklist_definition_id)
    );

    COMMENT ON TABLE  checklist_definition                          IS 'Maps checklist_id to checklist_item_id .';
    COMMENT ON COLUMN checklist_definition.checklist_definition_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist_definition.checklist_id             IS 'The id of the checklist.';
    COMMENT ON COLUMN checklist_definition.checklist_item_id        IS 'The id of the checklist item.';
    COMMENT ON COLUMN checklist_definition.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN checklist_definition.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist_definition.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist_definition.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.revision_count            IS 'Revision count used for concurrency control.';

        ----------------------------------------------------------------------------------------
    -- Create new table for checklist_definition
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_definition (
      checklist_definition_id   integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      checklist_id              integer            NOT NULL,
      checklist_ item_id        varchar(50)        NOT NULL,
      record_end_date           date,
      create_date               timestamptz(6)     DEFAULT now() NOT NULL,
      create_user               integer            NOT NULL,
      update_date               timestamptz(6),
      update_user               integer,
      revision_count            integer            DEFAULT 0 NOT NULL,
      CONSTRAINT checklist_definition_pk PRIMARY KEY (checklist_definition_id)
    );

    COMMENT ON TABLE  checklist_definition                          IS 'Maps checklist_id to checklist_item_id .';
    COMMENT ON COLUMN checklist_definition.checklist_definition_id  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN checklist_definition.checklist_id             IS 'The id of the checklist.';
    COMMENT ON COLUMN checklist_definition.checklist_item_id        IS 'The id of the checklist item.';
    COMMENT ON COLUMN checklist_definition.record_end_date          IS 'Record level end date.';
    COMMENT ON COLUMN checklist_definition.create_date              IS 'The datetime the record was created.';
    COMMENT ON COLUMN checklist_definition.create_user              IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.update_date              IS 'The datetime the record was updated.';
    COMMENT ON COLUMN checklist_definition.update_user              IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN checklist_definition.revision_count            IS 'Revision count used for concurrency control.';




    

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_alert BEFORE INSERT OR UPDATE OR DELETE ON biohub.alert FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_alert AFTER INSERT OR UPDATE OR DELETE ON biohub.alert FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_alert_type BEFORE INSERT OR UPDATE OR DELETE ON biohub.alert_type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_alert_type AFTER INSERT OR UPDATE OR DELETE ON biohub.alert FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create constraints/indexes on foreign keys
    ----------------------------------------------------------------------------------------

    ALTER TABLE alert ADD CONSTRAINT alert_fk1
      FOREIGN KEY (alert_type_id)
      REFERENCES alert_type(alert_type_id);
  
    CREATE INDEX alert_idx1 ON alert(alert_type_id);
        
  
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
