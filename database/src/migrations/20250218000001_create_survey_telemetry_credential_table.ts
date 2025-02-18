import { Knex } from 'knex';

/**
 * Add new survey_telemetry_credential table.
 *
 * Rationale: Helps to manage imported orphaned device keys (keys with no linked survey).
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
     SET SEARCH_PATH=biohub;
    
     CREATE TABLE survey_telemetry_credential (
      survey_telemetry_credential_id               integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                                    integer,
      survey_telemetry_vendor_credential_id        integer            NOT NULL,
      device_key                                   varchar            NOT NULL,
      create_date                                  timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                  integer            NOT NULL,
      update_date                                  timestamptz(6),
      update_user                                  integer,
      revision_count                               integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_telemetry_credential_pk PRIMARY KEY (survey_telemetry_credential_id)
    );

    COMMENT ON TABLE  survey_telemetry_credential                                             IS 'A record of a telemetry device credential that is associated with a survey.';
    COMMENT ON COLUMN survey_telemetry_credential.survey_telemetry_credential_id              IS '(Generated) Surrogate primary key identifier.';
    COMMENT ON COLUMN survey_telemetry_credential.survey_id                                   IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN survey_telemetry_credential.survey_telemetry_vendor_credential_id       IS 'Foreign key to the survey_telemetry_vendor_credential table.';
    COMMENT ON COLUMN survey_telemetry_credential.device_key                                  IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN survey_telemetry_credential.create_date                                 IS 'The datetime the record was created.';
    COMMENT ON COLUMN survey_telemetry_credential.create_user                                 IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN survey_telemetry_credential.update_date                                 IS 'The datetime the record was updated.';
    COMMENT ON COLUMN survey_telemetry_credential.update_user                                 IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN survey_telemetry_credential.revision_count                              IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE survey_telemetry_credential 
      ADD CONSTRAINT survey_telemetry_credential_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    -- Add foreign key constraints
    ALTER TABLE survey_telemetry_credential
      ADD CONSTRAINT survey_telemetry_credential_fk2
      FOREIGN KEY (survey_telemetry_vendor_credential_id)
      REFERENCES survey_telemetry_vendor_credential(survey_telemetry_vendor_credential_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_telemetry_credential_idx1 ON survey_telemetry_credential(survey_id);

    -- Add indexes
    CREATE INDEX survey_telemetry_credential_idx2 ON survey_telemetry_credential(survey_telemetry_vendor_credential_id);

    -- Add indexes
    CREATE INDEX survey_telemetry_credential_idx3 ON survey_telemetry_credential(device_key);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_survey_telemetry_credential BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_telemetry_credential FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_telemetry_credential AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_telemetry_credential FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
