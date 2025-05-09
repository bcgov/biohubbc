import { Knex } from 'knex';

/**
 * Table for user-specific survey filters
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    ----------------------------------------------------------------------------------------
    -- CHECKLIST ITEM TABLE
    ----------------------------------------------------------------------------------------

    CREATE TABLE checklist_item (
        checklist_item_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                      varchar(50)       NOT NULL,
        description               varchar(500),
        parent_checklist_item_id  integer,
        record_effective_date     timestamptz(6)              NOT NULL,
        record_end_date           timestamptz(6),
        create_date               timestamptz(6)    DEFAULT now() NOT NULL,
        create_user               integer           NOT NULL,
        update_date               timestamptz(6),
        update_user               integer,
        revision_count            integer           DEFAULT 0 NOT NULL,
        CONSTRAINT checklist_item_pk PRIMARY KEY (checklist_item_id),
    );

    COMMENT ON COLUMN checklist_item.checklist_item_id IS 'System-generated primary key identifier for the checklist item.';
    COMMENT ON COLUMN checklist_item.name IS 'The name of the checklist item.';
    COMMENT ON COLUMN checklist_item.description IS 'Description of the checklist item.';
    COMMENT ON COLUMN checklist_item.record_effective_date IS 'Effective date of the checklist item.';
    COMMENT ON COLUMN checklist_item.record_end_date IS 'End date (if applicable) of the checklist item.';
    COMMENT ON COLUMN checklist_item.create_date IS 'Timestamp when the checklist item was created.';
    COMMENT ON COLUMN checklist_item.create_user IS 'ID of the user who created the checklist item.';
    COMMENT ON COLUMN checklist_item.update_date IS 'Timestamp when the checklist item was last updated.';
    COMMENT ON COLUMN checklist_item.update_user IS 'ID of the user who last updated the checklist item.';
    COMMENT ON COLUMN checklist_item.revision_count IS 'Revision count for concurrency control (incremented for every update).';
    COMMENT ON TABLE checklist_item IS 'Table for storing checklist items used in surveys.';

    CREATE TRIGGER audit_checklist_item
    BEFORE INSERT OR UPDATE OR DELETE ON checklist_item
    FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    
    CREATE TRIGGER journal_checklist_item
    AFTER INSERT OR UPDATE OR DELETE ON checklist_item
    FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    ----------------------------------------------------------------------------------------

    INSERT INTO checklist_item (name, description, record_effective_date)
    VALUES 
      ('sites', 'Precise locations where species observed were collected', now()),
      ('techniques', 'The methods used to collect species observations', now()),
      ('periods', 'The time periods during which samples were collected', now()),
      ('observations', 'Observational data collected during the survey', now()),
      ('devices', 'Telemetry devices used in the survey', now()),
      ('deployments', 'Deployment events of telemetry devices', now()),
      ('locations', 'Location data collected via telemetry', now()),
      ('animals', 'Animals involved in the survey (e.g. tagged individuals)', now()),
      ('habitat', 'Habitat features recorded during the survey', now()),
      ('attachments', 'Files and documents attached to the survey', now());


    ----------------------------------------------------------------------------------------
    -- SURVEY CHECKLIST ITEM TABLE
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_checklist_item_ignore (
        survey_checklist_item_ignore_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        checklist_item_id           INTEGER           NOT NULL,
        survey_id                   INTEGER           NOT NULL,
        create_date                 timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                 integer           NOT NULL,
        update_date                 timestamptz(6),
        update_user                 integer,
        revision_count              integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_checklist_item_ignore_pk PRIMARY KEY (survey_checklist_item_ignore_id),
        CONSTRAINT survey_checklist_item_ignore_checklist_item_fk FOREIGN KEY (checklist_item_id) REFERENCES checklist_item (checklist_item_id),
        CONSTRAINT survey_checklist_item_ignore_survey_fk FOREIGN KEY (survey_id) REFERENCES survey (survey_id)
    );

    CREATE INDEX survey_checklist_item_ignore_idx1 ON survey_checklist_item_ignore (checklist_item_id);
    CREATE INDEX survey_checklist_item_ignore_idx2 ON survey_checklist_item_ignore (survey_id);
    CREATE UNIQUE INDEX survey_checklist_item_ignore_nuk1 ON survey_checklist_item_ignore (survey_id, checklist_item_id);

    COMMENT ON COLUMN survey_checklist_item_ignore.survey_checklist_item_ignore_id IS 'System-generated primary key identifier for the survey checklist item.';
    COMMENT ON COLUMN survey_checklist_item_ignore.checklist_item_id IS 'Foreign key to the checklist_item table.';
    COMMENT ON COLUMN survey_checklist_item_ignore.survey_id IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN survey_checklist_item_ignore.create_date IS 'Timestamp when the survey checklist item was created.';
    COMMENT ON COLUMN survey_checklist_item_ignore.create_user IS 'ID of the user who created the survey checklist item.';
    COMMENT ON COLUMN survey_checklist_item_ignore.update_date IS 'Timestamp when the survey checklist item was last updated.';
    COMMENT ON COLUMN survey_checklist_item_ignore.update_user IS 'ID of the user who last updated the survey checklist item.';
    COMMENT ON COLUMN survey_checklist_item_ignore.revision_count IS 'Revision count for concurrency control (incremented for every update).';
    COMMENT ON TABLE survey_checklist_item_ignore IS 'Table for joining checklist items to surveys and marking their applicability.';

    CREATE TRIGGER audit_survey_checklist_item_ignore
    BEFORE INSERT OR UPDATE OR DELETE ON survey_checklist_item_ignore
    FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    
    CREATE TRIGGER journal_survey_checklist_item_ignore
    AFTER INSERT OR UPDATE OR DELETE ON survey_checklist_item_ignore
    FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
