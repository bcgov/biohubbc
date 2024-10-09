import { Knex } from 'knex';

/**
 * Add new tables (migrated from from BCTW)
 * - deployment2 (to be renamed when it replaces the existing 'deployment' table)
 * - device
 * - telemetry_manual
 * - telemetry_credential_lotek
 * - telemetry_credential_vectronic
 * - survey_telemetry_vendor_credential
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Create new tables
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE deployment2 (
      deployment2_id                  integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
      CONSTRAINT deployment2_pk PRIMARY KEY (deployment2_id)
    );

    COMMENT ON TABLE  deployment2                                 IS 'A deployment of a telemetry (or similar) device on an animal.';
    COMMENT ON COLUMN deployment2.deployment2_id                  IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN deployment2.survey_id                       IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN deployment2.critter_id                      IS 'Foreign key to the critter table.';
    COMMENT ON COLUMN deployment2.device_id                       IS 'Foreign key to the device table.';
    COMMENT ON COLUMN deployment2.device_key                      IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN deployment2.attachment_start                IS 'The date the telemetry device was attached.';
    COMMENT ON COLUMN deployment2.attachment_end                  IS 'The date the telemetry device was removed.';
    COMMENT ON COLUMN deployment2.critterbase_capture_id          IS 'UUID of an external Critterbase capture record. The capture event during which the device was attached to the animal.';
    COMMENT ON COLUMN deployment2.critterbase_end_capture_id      IS 'UUID of an external Critterbase capture record. The capture event during which the device was removed from the animal.';
    COMMENT ON COLUMN deployment2.critterbase_end_mortality_id    IS 'UUID of an external Critterbase mortality record. The mortality event during which the device was removed from the animal.';
    COMMENT ON COLUMN deployment2.create_date                     IS 'The datetime the record was created.';
    COMMENT ON COLUMN deployment2.create_user                     IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN deployment2.update_date                     IS 'The datetime the record was updated.';
    COMMENT ON COLUMN deployment2.update_user                     IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN deployment2.revision_count                  IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE deployment2
      ADD CONSTRAINT deployment2_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    ALTER TABLE deployment2
      ADD CONSTRAINT deployment2_fk2
      FOREIGN KEY (critter_id)
      REFERENCES critter(critter_id);

    ALTER TABLE deployment2
      ADD CONSTRAINT deployment2_fk3
      FOREIGN KEY (device_id, device_key)
      REFERENCES device(device_id, device_key);

    -- Add indexes for foreign keys
    CREATE INDEX deployment2_idx1 ON deployment2(survey_id);

    CREATE INDEX deployment2_idx2 ON deployment2(critter_id);

    CREATE INDEX deployment2_idx3 ON deployment2(device_id, device_key);

    -- Add indexes
    -- Note: an index on device_id is already created as part of the composite key above, because its the first column
    CREATE INDEX deployment2_idx4 ON deployment2(device_key);

    ----------------------------------------------------------------------------------------

    CREATE TABLE device (
      device_id         integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_id         integer            NOT NULL,
      device_key        varchar            NOT NULL,
      serial            integer            NOT NULL,
      make              integer            NOT NULL,
      model             varchar(100),
      comment           varchar(250),
      create_date       timestamptz(6)     DEFAULT now() NOT NULL,
      create_user       integer            NOT NULL,
      update_date       timestamptz(6),
      update_user       integer,
      revision_count    integer            DEFAULT 0 NOT NULL,
      CONSTRAINT device_pk PRIMARY KEY (device_id)
    );

    COMMENT ON TABLE  device                   IS 'A device of a telemetry (or similar) device on an animal.';
    COMMENT ON COLUMN device.device_id         IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN device.survey_id         IS 'Foreign key to the survey table.';
    COMMENT ON COLUMN device.device_key        IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN device.serial            IS 'The serial number of the device.';
    COMMENT ON COLUMN device.make              IS 'The device vendor.';
    COMMENT ON COLUMN device.model             IS 'The device model.';
    COMMENT ON COLUMN device.comment           IS 'A comment about the device.';
    COMMENT ON COLUMN device.create_date       IS 'The datetime the record was created.';
    COMMENT ON COLUMN device.create_user       IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN device.update_date       IS 'The datetime the record was updated.';
    COMMENT ON COLUMN device.update_user       IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN device.revision_count    IS 'Revision count used for concurrency control.';

    -- Add foreign key constraints
    ALTER TABLE device
      ADD CONSTRAINT device_fk1
      FOREIGN KEY (survey_id)
      REFERENCES survey(survey_id);

    -- Add indexes for foreign keys
    CREATE INDEX device_idx1 ON device(survey_id);

    -- Add indexes
    CREATE INDEX deployment2_idx3 ON deployment2(device_id, device_key);

    CREATE INDEX device_idx2 ON device(device_key);

    CREATE UNIQUE INDEX device_idx3 ON device(device_serial);

    ----------------------------------------------------------------------------------------

    CREATE TABLE telemetry_manual (
      telemetry_manual_id    uuid               DEFAULT public.gen_random_uuid(),
      deployment2_id         integer            NOT NULL,
      latitude               numeric(10, 7)     NOT NULL,
      longitude              numeric(10, 7)     NOT NULL,
      acquisition_date       timestamptz(6)     NOT NULL,
      transmission_date      timestamptz(6),
      create_date            timestamptz(6)     DEFAULT now() NOT NULL,
      create_user            integer            NOT NULL,
      update_date            timestamptz(6),
      update_user            integer,
      revision_count         integer            DEFAULT 0 NOT NULL,
      CONSTRAINT telemetry_manual_pk PRIMARY KEY (telemetry_manual_id)
    );

    COMMENT ON TABLE  telemetry_manual                        IS 'A manually entered telemetry record.';
    COMMENT ON COLUMN telemetry_manual.telemetry_manual_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN telemetry_manual.deployment2_id         IS 'Foreign key to the deployment table.';
    COMMENT ON COLUMN telemetry_manual.latitude               IS 'The latitude of the telemetry record, having ten points of total precision and 7 points of precision after the decimal.'
    COMMENT ON COLUMN telemetry_manual.longitude              IS 'The longitude of the telemetry record, having ten points of total precision and 7 points of precision after the decimal.'
    COMMENT ON COLUMN telemetry_manual.acquisition_date       IS 'The date the telemetry record was recorded.';
    COMMENT ON COLUMN telemetry_manual.transmission_date      IS 'The date the telemetry record was transmitted.';
    COMMENT ON COLUMN telemetry_manual.create_date            IS 'The datetime the record was created.';
    COMMENT ON COLUMN telemetry_manual.create_user            IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_manual.update_date            IS 'The datetime the record was updated.';
    COMMENT ON COLUMN telemetry_manual.update_user            IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_manual.revision_count         IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------

    CREATE TABLE telemetry_credential_lotek (
      telemetry_credential_lotek_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      device_id                        varchar(50)        NOT NULL,
      device_key                       varchar            NOT NULL,
      ndeviceid                        integer            NOT NULL,
      strspecialid                     varchar(100),
      dtcreated                        timestamptz(6),
      strsatellite                     varchar(100),
      verified_date                    timestamptz(6),
      is_valid                         boolean,
      create_date                      timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                      integer            NOT NULL,
      update_date                      timestamptz(6),
      update_user                      integer,
      revision_count                   integer            DEFAULT 0 NOT NULL,
      CONSTRAINT telemetry_credential_lotek_pk PRIMARY KEY (telemetry_credential_lotek_id)
    )

    COMMENT ON TABLE  telemetry_credential_lotek                                  IS 'Lotek telemetry device credentials.';
    COMMENT ON COLUMN telemetry_credential_lotek.telemetry_credential_lotek_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN telemetry_credential_lotek.device_id                        IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN telemetry_credential_lotek.device_key                       IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN telemetry_credential_lotek.ndeviceid                        IS 'The Lotek unique id for the device.';
    COMMENT ON COLUMN telemetry_credential_lotek.strspecialid                     IS 'The Lotek IMEI number.';
    COMMENT ON COLUMN telemetry_credential_lotek.strsatellite                     IS 'The Lotek satellite name.';
    COMMENT ON COLUMN telemetry_credential_lotek.verified_date                    IS 'The date the credential was verified (by uploading the cfg file to lotek and confirming it is valid).';
    COMMENT ON COLUMN telemetry_credential_lotek.is_valid                         IS 'True if the credential is valid, false if it is invalid.';
    COMMENT ON COLUMN telemetry_credential_lotek.dtrecord_added                   IS 'The date the record was added.';
    COMMENT ON COLUMN telemetry_credential_lotek.create_date                      IS 'The datetime the record was created.';
    COMMENT ON COLUMN telemetry_credential_lotek.create_user                      IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_credential_lotek.update_date                      IS 'The datetime the record was updated.';
    COMMENT ON COLUMN telemetry_credential_lotek.update_user                      IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_credential_lotek.revision_count                   IS 'Revision count used for concurrency control.';

    -- Add indexes
    CREATE UNIQUE INDEX telemetry_credential_lotek_idx1 ON telemetry_credential_lotek(device_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE telemetry_credential_vectronic (
      telemetry_credential_vectronic_id    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      device_key                           varchar            NOT NULL,
      idcollar                             integer            NOT NULL,
      comtype                              varchar(50)        NOT NULL,
      idcom                                integer            NOT NULL,
      collarkey                            varchar(1000)      NOT NULL,
      collartype                           integer            NOT NULL,
      create_date                          timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                          integer            NOT NULL,
      update_date                          timestamptz(6),
      update_user                          integer,
      revision_count                       integer            DEFAULT 0 NOT NULL,
      CONSTRAINT telemetry_credential_vectronic_pk PRIMARY KEY (telemetry_credential_vectronic_id)
    )

    COMMENT ON TABLE  telemetry_credential_lotek                                  IS 'Vectronic telemetry device credentials.';
    COMMENT ON COLUMN telemetry_credential_lotek.telemetry_credential_lotek_id    IS 'System generated surrogate primary key identifier.';
    COMMENT ON COLUMN telemetry_credential_lotek.device_key                       IS 'The SIMS unique key for the device.';
    COMMENT ON COLUMN telemetry_credential_lotek.idcollar                         IS 'The Vectronic unique id for the device.';
    COMMENT ON COLUMN telemetry_credential_lotek.comtype                          IS 'The Vectronic comtype field.';
    COMMENT ON COLUMN telemetry_credential_lotek.idcom                            IS 'The Vectronic idcom field.';
    COMMENT ON COLUMN telemetry_credential_lotek.collarkey                        IS 'The Vectronic device key.';
    COMMENT ON COLUMN telemetry_credential_lotek.collartype                       IS 'The Vectronic device type.';
    COMMENT ON COLUMN telemetry_credential_lotek.create_date                      IS 'The datetime the record was created.';
    COMMENT ON COLUMN telemetry_credential_lotek.create_user                      IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_credential_lotek.update_date                      IS 'The datetime the record was updated.';
    COMMENT ON COLUMN telemetry_credential_lotek.update_user                      IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN telemetry_credential_lotek.revision_count                   IS 'Revision count used for concurrency control.';

    -- Add indexes
    CREATE UNIQUE INDEX telemetry_credential_vectronic_idx1 ON telemetry_credential_vectronic(device_id);

    ----------------------------------------------------------------------------------------

    CREATE TABLE survey_telemetry_vendor_credential (
      survey_telemetry_vendor_credential_id        integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      survey_telemetry_credential_attachment_id    integer            NOT NULL,
      device_id                                    varchar(50)        NOT NULL,
      device_key                                   varchar            NOT NULL,
      create_date                                  timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                  integer            NOT NULL,
      update_date                                  timestamptz(6),
      update_user                                  integer,
      revision_count                               integer            DEFAULT 0 NOT NULL,
      CONSTRAINT survey_telemetry_vendor_credential_pk PRIMARY KEY (survey_telemetry_vendor_credential_id)
    )



    -- Add foreign key constraints
    ALTER TABLE survey_telemetry_vendor_credential
      ADD CONSTRAINT survey_telemetry_vendor_credential_fk1
      FOREIGN KEY (survey_telemetry_credential_attachment_id)
      REFERENCES survey_telemetry_credential_attachment(survey_telemetry_credential_attachment_id);

    -- Add indexes for foreign keys
    CREATE INDEX survey_telemetry_vendor_credential_idx1 ON survey_telemetry_vendor_credential(survey_telemetry_credential_attachment_id);

    -- Add indexes
    CREATE INDEX survey_telemetry_vendor_credential_idx2 ON survey_telemetry_vendor_credential(device_id);

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_deployment2 BEFORE INSERT OR UPDATE OR DELETE ON biohub.deployment2 FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_deployment2 AFTER INSERT OR UPDATE OR DELETE ON biohub.deployment2 FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_device BEFORE INSERT OR UPDATE OR DELETE ON biohub.device FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_device AFTER INSERT OR UPDATE OR DELETE ON biohub.device FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_telemetry_manual BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_manual FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_manual AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_manual FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_telemetry_credential_lotek BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_credential_lotek FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_credential_lotek AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_credential_lotek FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_telemetry_credential_vectronic BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_credential_vectronic FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_credential_vectronic AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_credential_vectronic FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    CREATE TRIGGER audit_survey_telemetry_vendor_credential BEFORE INSERT OR UPDATE OR DELETE ON biohub.survey_telemetry_vendor_credential FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_survey_telemetry_vendor_credential AFTER INSERT OR UPDATE OR DELETE ON biohub.survey_telemetry_vendor_credential FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Create views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW deployment2 AS SELECT * FROM biohub.deployment2;

    CREATE OR REPLACE VIEW device AS SELECT * FROM biohub.device;

    CREATE OR REPLACE VIEW telemetry_manual AS SELECT * FROM biohub.telemetry_manual;

    CREATE OR REPLACE VIEW telemetry_credential_lotek AS SELECT * FROM biohub.telemetry_credential_lotek;

    CREATE OR REPLACE VIEW telemetry_credential_vectronic AS SELECT * FROM biohub.telemetry_credential_vectronic;

    CREATE OR REPLACE VIEW survey_telemetry_vendor_credential AS SELECT * FROM biohub.survey_telemetry_vendor_credential;

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
