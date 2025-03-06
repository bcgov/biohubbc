import { Knex } from 'knex';

// Manual step 2 (see JSDoc comment below)
// UPDATE survey_telemetry_credential_attachment SET key = REGEXP_REPLACE(key, '(.*/\d+/surveys/\d+/)([^/]+\.pdf)', '\1telemetry-credentials/\2');

/**
 * Create 1 new table for storing telemetry device credential attachments (ex: device KeyX or Cfg files).
 * - survey_telemetry_credential_attachment
 *
 * Migrate existing survey attachments with file_type 'keyx' to the new survey_telemetry_credential_attachment table.
 *
 * Manual steps after running this migration:
 *
 * 1. Move all keyx files in S3 from '...surveys/{surveyId}/<file_name>' to
 * 'surveys/{surveyId}/telemetry-credentials/<file_name' using S3 Browser or a similar tool.
 *
 * 2. Execute query to update the key column in the survey_telemetry_credential_attachment table with the new S3 key.
 * See query commented out above.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Create table
    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_telemetry_credential_attachment (
        survey_telemetry_credential_attachment_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        uuid                                         uuid              DEFAULT public.gen_random_uuid(),
        survey_id                                    integer           NOT NULL,
        file_type                                    varchar(300)      NOT NULL,
        file_name                                    varchar(300),
        title                                        varchar(300),
        description                                  varchar(250),
        key                                          varchar(1000)     NOT NULL,
        file_size                                    integer,
        create_date                                  timestamptz(6)    DEFAULT now() NOT NULL,
        create_user                                  integer           NOT NULL,
        update_date                                  timestamptz(6),
        update_user                                  integer,
        revision_count                               integer           DEFAULT 0 NOT NULL,
        CONSTRAINT survey_telemetry_credential_attachment_pk PRIMARY KEY (survey_telemetry_credential_attachment_id)
    );

    COMMENT ON COLUMN survey_telemetry_credential_attachment.survey_telemetry_credential_attachment_id IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.uuid                                      IS 'The universally unique identifier for the record.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.survey_id                                 IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.file_type                                 IS 'The attachment type. Attachment type examples include keyx, cfg, etc.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.file_name                                 IS 'The name of the file attachment.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.title                                     IS 'The title of the file.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.description                               IS 'The description of the record.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.key                                       IS 'The identifying key to the file in the storage system.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.file_size                                 IS 'The size of the file in bytes.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.create_date                               IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.create_user                               IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.update_date                               IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.update_user                               IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_telemetry_credential_attachment.revision_count                            IS 'Revision count used for concurrency control.';
    COMMENT ON TABLE  survey_telemetry_credential_attachment                                           IS 'A list of telemetry device credential files (ex: device credential files like Keyx or Cfg).';


  -- Add foreign key constraints
    ALTER TABLE survey_telemetry_credential_attachment 
        ADD CONSTRAINT survey_telemetry_credential_attachment_fk1
        FOREIGN KEY (survey_id)
        REFERENCES survey(survey_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_telemetry_credential_attachment_idx1 ON survey_telemetry_credential_attachment(survey_id);

    ----------------------------------------------------------------------------------------
    -- Create audit and journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_survey_telemetry_credential_attachment BEFORE INSERT OR UPDATE OR DELETE ON survey_telemetry_credential_attachment FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_telemetry_credential_attachment AFTER INSERT OR UPDATE OR DELETE ON survey_telemetry_credential_attachment FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Migrate existing survey attachments with file_type 'keyx' to the new 
    -- survey_telemetry_credential_attachment table.
    ----------------------------------------------------------------------------------------

    INSERT INTO survey_telemetry_credential_attachment
    (
      survey_id,
      file_type,
      file_name,
      title,
      description,
      key,
      file_size,
      create_user,
      create_date,
      update_user,
      update_date,
      revision_count
    )
    SELECT
      survey_id,
      'KeyX',
      file_name,
      title,
      description,
      key,
      file_size,
      create_user,
      create_date,
      update_user,
      update_date,
      revision_count
    FROM
      survey_attachment
    WHERE
      file_type = 'keyx';

    -- Remove the migrated records from the survey_attachment table
    DELETE FROM survey_attachment 
    WHERE file_type = 'keyx';

    ----------------------------------------------------------------------------------------
    -- Create view
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW survey_telemetry_credential_attachment as SELECT * FROM biohub.survey_telemetry_credential_attachment;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
