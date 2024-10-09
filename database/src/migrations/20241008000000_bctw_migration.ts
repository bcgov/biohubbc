import { Knex } from 'knex';

/**
 * Bug fix:
 * Observation subcount sign id cannot be null, so this updates observation subcount records to change null values to 'direct sighting'.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create new tables
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE deployment2 (
      deployment_id                   integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id                       integer            NOT NULL,
      critter_id                      integer            NOT NULL,
      device_id                       integer            NOT NULL,
      attachment_start                timestamptz(6)     NOT NULL,
      attachment_end                  timestamptz(6),
      critterbase_start_capture_id    uuid,
      critterbase_end_capture_id      uuid,
      critterbase_end_mortality_id    uuid,
      create_date                     timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                     integer            NOT NULL,
      update_date                     timestamptz(6),
      update_user                     integer,
      revision_count                  integer            DEFAULT 0 NOT NULL,
      CONSTRAINT deployment_pk PRIMARY KEY (deployment_id)
    );

    COMMENT ON TABLE  deployment                                 IS 'A deployment of a telemetry (or similar) device on an animal.';
    COMMENT ON COLUMN deployment.deployment_id                   IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN deployment.survey_id                       IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN deployment.critter_id                      IS 'Foreign key to the critter table.';
    COMMENT ON COLUMN deployment.device_id                       IS 'Foreign key to the device table.';
    COMMENT ON COLUMN deployment.attachment_start                IS 'The universally unique identifier for the record.';
    COMMENT ON COLUMN deployment.attachment_end                  IS 'Foreign key reference to the SIMS critter table.';
    COMMENT ON COLUMN deployment.critterbase_capture_id          IS 'UUID of an external Critterbase capture record. The capture event during which the device was attached to the animal.';
    COMMENT ON COLUMN deployment.critterbase_end_capture_id      IS 'UUID of an external Critterbase capture record. The capture event during which the device was removed from the animal.';
    COMMENT ON COLUMN deployment.critterbase_end_mortality_id    IS 'UUID of an external Critterbase mortality record. The mortality event during which the device was removed from the animal.';
    COMMENT ON COLUMN deployment.create_date                     IS 'The datetime the record was created.';
    COMMENT ON COLUMN deployment.create_user                     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN deployment.update_date                     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN deployment.update_user                     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN deployment.revision_count                  IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE deployment
      ADD CONSTRAINT deployment_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    ALTER TABLE deployment
      ADD CONSTRAINT deployment_fk2
      FOREIGN KEY (critter_id)
      REFERENCES critter(critter_id);

    ALTER TABLE deployment
      ADD CONSTRAINT deployment_fk3
      FOREIGN KEY (device_id)
      REFERENCES device(device_id);

    -- Add indexes for foreign keys
    CREATE INDEX deployment_idx1 ON deployment(survey_id);

    CREATE INDEX deployment_idx2 ON deployment(critter_id);

    CREATE INDEX deployment_idx3 ON deployment(device_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE telemetry_manual (
      telemetry_manual_id             integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      deployment_id                   integer            NOT NULL,
      latitude                        numeric(10, 7)     NOT NULL,
      longitude                       numeric(10, 7)     NOT NULL,
      acquisition_date                timestamptz(6),
      create_date                     timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                     integer            NOT NULL,
      update_date                     timestamptz(6),
      update_user                     integer,
      revision_count                  integer            DEFAULT 0 NOT NULL,
      CONSTRAINT telemetry_manual_pk PRIMARY KEY (telemetry_manual_id)
    );

    COMMENT ON TABLE  telemetry_manual                                 IS 'A telemetry_manual of a telemetry (or similar) telemetry_manual on an animal.';
    COMMENT ON COLUMN telemetry_manual.telemetry_manual_id                       IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN telemetry_manual.survey_id                       IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN telemetry_manual.critter_id                      IS 'Foreign key to the critter table.';
    COMMENT ON COLUMN telemetry_manual.telemetry_manual_id                       IS 'Foreign key to the telemetry_manual table.';
    COMMENT ON COLUMN telemetry_manual.attachment_start                IS 'The universally unique identifier for the record.';
    COMMENT ON COLUMN telemetry_manual.attachment_end                  IS 'Foreign key reference to the SIMS critter table.';
    COMMENT ON COLUMN telemetry_manual.critterbase_capture_id          IS 'UUID of an external Critterbase capture record. The capture event during which the telemetry_manual was attached to the animal.';
    COMMENT ON COLUMN telemetry_manual.critterbase_end_capture_id      IS 'UUID of an external Critterbase capture record. The capture event during which the telemetry_manual was removed from the animal.';
    COMMENT ON COLUMN telemetry_manual.critterbase_end_mortality_id    IS 'UUID of an external Critterbase mortality record. The mortality event during which the telemetry_manual was removed from the animal.';
    COMMENT ON COLUMN telemetry_manual.create_date                     IS 'The datetime the record was created.';
    COMMENT ON COLUMN telemetry_manual.create_user                     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_manual.update_date                     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN telemetry_manual.update_user                     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_manual.revision_count                  IS 'Revision count used for concurrency control.';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
