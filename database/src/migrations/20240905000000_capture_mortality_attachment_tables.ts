import { Knex } from 'knex';

/**
 * Create 2 new tables:
 *
 * CRITTER CAPTURE ATTACHMENT
 * - critter_capture_attachment
 *
 * CRITTER MORTALITY ATTACHMENT
 * - critter_mortality_attachment
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create capture and mortality attachment tables
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    SET SEARCH_PATH=biohub, public;

    ----------------------------------------------------------------------------------------
    -- Create capture attachment table
    ----------------------------------------------------------------------------------------

    CREATE TABLE critter_capture_attachment (
      critter_capture_attachment_id  integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      uuid                           uuid               DEFAULT public.gen_random_uuid(),
      critter_id                     integer            NOT NULL,
      critterbase_capture_id         uuid               NOT NULL,
      file_type                      varchar(300)       NOT NULL,
      file_name                      varchar(300),
      title                          varchar(300),
      description                    varchar(250),
      key                            varchar(1000)      NOT NULL,
      file_size                      integer,
      create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                    integer            NOT NULL,
      update_date                    timestamptz(6),
      update_user                    integer,
      revision_count                 integer            DEFAULT 0 NOT NULL,

      CONSTRAINT critter_capture_attachment_pk          PRIMARY KEY (critter_capture_attachment_id)
    );

    COMMENT ON TABLE  critter_capture_attachment                                           IS 'A list of critter capture files (ex: critter capture files like pdf or jpeg).';
    COMMENT ON COLUMN critter_capture_attachment.critter_capture_attachment_id             IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN critter_capture_attachment.uuid                                      IS 'The universally unique identifier for the record.';
    COMMENT ON COLUMN critter_capture_attachment.critter_id                                IS 'Foreign key reference to the SIMS critter table.';
    COMMENT ON COLUMN critter_capture_attachment.critterbase_capture_id                    IS 'Critterbase capture identifier. External reference the Critterbase capture table.';
    COMMENT ON COLUMN critter_capture_attachment.file_type                                 IS 'The attachment type. Attachment type examples include keyx, cfg, etc.';
    COMMENT ON COLUMN critter_capture_attachment.file_name                                 IS 'The name of the file attachment.';
    COMMENT ON COLUMN critter_capture_attachment.title                                     IS 'The title of the file.';
    COMMENT ON COLUMN critter_capture_attachment.description                               IS 'The description of the record.';
    COMMENT ON COLUMN critter_capture_attachment.key                                       IS 'The identifying key to the file in the storage system.';
    COMMENT ON COLUMN critter_capture_attachment.file_size                                 IS 'The size of the file in bytes.';
    COMMENT ON COLUMN critter_capture_attachment.create_date                               IS 'The datetime the record was created.';
    COMMENT ON COLUMN critter_capture_attachment.create_user                               IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN critter_capture_attachment.update_date                               IS 'The datetime the record was updated.';
    COMMENT ON COLUMN critter_capture_attachment.update_user                               IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN critter_capture_attachment.revision_count                            IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE critter_capture_attachment
        ADD CONSTRAINT critter_capture_attachment_fk1
        FOREIGN KEY (critter_id)
        REFERENCES critter(critter_id);

    -- Add indexes for foreign keys
    CREATE INDEX critter_capture_attachment_idx1 ON critter_capture_attachment(critter_id);
    CREATE UNIQUE INDEX critter_capture_attachment_idx2 ON critter_capture_attachment(critter_id, critterbase_capture_id, file_name);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_critter_capture_attachment BEFORE INSERT OR UPDATE OR DELETE ON critter_capture_attachment FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_critter_capture_attachment AFTER INSERT OR UPDATE OR DELETE ON critter_capture_attachment FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();



    ----------------------------------------------------------------------------------------
    -- Create mortality attachment table
    ----------------------------------------------------------------------------------------

    CREATE TABLE critter_mortality_attachment (
      critter_mortality_attachment_id  integer          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      uuid                           uuid               DEFAULT public.gen_random_uuid(),
      critter_id                     integer            NOT NULL,
      critterbase_mortality_id       uuid               NOT NULL,
      file_type                      varchar(300)       NOT NULL,
      file_name                      varchar(300),
      title                          varchar(300),
      description                    varchar(250),
      key                            varchar(1000)      NOT NULL,
      file_size                      integer,
      create_date                    timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                    integer            NOT NULL,
      update_date                    timestamptz(6),
      update_user                    integer,
      revision_count                 integer            DEFAULT 0 NOT NULL,

      CONSTRAINT critter_mortality_attachment_pk        PRIMARY KEY (critter_mortality_attachment_id)
    );

    COMMENT ON TABLE  critter_mortality_attachment                                           IS 'A list of critter mortality files (ex: critter mortality files like pdf or jpeg).';
    COMMENT ON COLUMN critter_mortality_attachment.critter_mortality_attachment_id           IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN critter_mortality_attachment.uuid                                      IS 'The universally unique identifier for the record.';
    COMMENT ON COLUMN critter_mortality_attachment.critter_id                                IS 'Foreign key reference to the SIMS critter table.';
    COMMENT ON COLUMN critter_mortality_attachment.critterbase_mortality_id                  IS 'Critterbase mortality identifier. External reference to the Critterbase mortality table.';
    COMMENT ON COLUMN critter_mortality_attachment.file_type                                 IS 'The attachment type. Attachment type examples include keyx, cfg, etc.';
    COMMENT ON COLUMN critter_mortality_attachment.file_name                                 IS 'The name of the file attachment.';
    COMMENT ON COLUMN critter_mortality_attachment.title                                     IS 'The title of the file.';
    COMMENT ON COLUMN critter_mortality_attachment.description                               IS 'The description of the record.';
    COMMENT ON COLUMN critter_mortality_attachment.key                                       IS 'The identifying key to the file in the storage system.';
    COMMENT ON COLUMN critter_mortality_attachment.file_size                                 IS 'The size of the file in bytes.';
    COMMENT ON COLUMN critter_mortality_attachment.create_date                               IS 'The datetime the record was created.';
    COMMENT ON COLUMN critter_mortality_attachment.create_user                               IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN critter_mortality_attachment.update_date                               IS 'The datetime the record was updated.';
    COMMENT ON COLUMN critter_mortality_attachment.update_user                               IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN critter_mortality_attachment.revision_count                            IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE critter_mortality_attachment
        ADD CONSTRAINT critter_mortality_attachment_fk1
        FOREIGN KEY (critter_id)
        REFERENCES critter(critter_id);

    -- Add indexes for foreign keys
    CREATE INDEX critter_mortality_attachment_idx1 ON critter_mortality_attachment(critter_id);
    CREATE UNIQUE INDEX critter_mortality_attachment_idx2 ON critter_mortality_attachment(critter_id, critterbase_mortality_id, file_name);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_critter_mortality_attachment BEFORE INSERT OR UPDATE OR DELETE ON critter_capture_attachment FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_critter_mortality_attachment AFTER INSERT OR UPDATE OR DELETE ON critter_capture_attachment FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW critter_capture_attachment as SELECT * FROM biohub.critter_capture_attachment;
    CREATE OR REPLACE VIEW critter_mortality_attachment as SELECT * FROM biohub.critter_mortality_attachment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
