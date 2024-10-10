import { Knex } from 'knex';
/**
 * TABLE: telemetry_ats
 *  Raw row identifier: N/A
 *  Collar serial: `collarserialnumber`
 *  Device make: `ats` - Must match a value in the device_make lookup table
 *
 * Notes:
 *  1. Generating a UUID column for the primary key to prevent collisions with other telemetry sources.
 *  2. Column `timeid` (psuedo primary key) is deprecated and will be removed after the BCTW data migration.
 *  3. Generating the `device_key` as a combination of the device make and collar serial number.
 *  4. The `collarserialnumber` value was previously Nullable, but is now required to generate the device_id.
 *
 * TABLE: telemetry_vectronic
 *  Raw row identifier: `idposition`
 *  Collar serial: `idcollar`
 *  Device make: `vectronic` - Must match a value in the device_make lookup table
 *
 * Notes:
 *  1. Generating a UUID column for the primary key to prevent collisions with other telemetry sources.
 *  2. Generating the `device_key` as a combination of the device make and collar serial number.
 *
 * TABLE: telemetry_lotek
 *  Raw row identifier: N/A
 *  Collar serial: `deviceid` - Must match a value in the device_make lookup table
 *
 * Notes:
 *  1. Generating a UUID column for the primary key to prevent collisions with other telemetry sources.
 *  2. Generating the `device_key` as a combination of the device make and collar serial number.
 *  3. Dropping the previously used `timeid` column as the primary key and replacing it with a UUID.
 *  4. The `deviceid` value was previously Nullable, but is now required to generate the device_id.
 *  There is data in BCTW currently where that value is NULL, but since we will fetch all the data
 *  fresh this shouldn't be a problem.
 *
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- Create telemetry_ats table
    ----------------------------------------------------------------------------------------
    CREATE TABLE telemetry_ats (
      telemetry_ats_id        uuid DEFAULT public.gen_random_uuid() NOT NULL,
      device_key              varchar GENERATED ALWAYS AS ('ats:' || collarserialnumber::text) STORED,

      collarserialnumber      int4 NOT NULL,
      "date"                  timestamptz NULL,
      numberfixes             int4 NULL,
      battvoltage             float8 NULL,
      mortality               bool NULL,
      breakoff                bool NULL,
      gpsontime               int4 NULL,
      satontime               int4 NULL,
      saterrors               int4 NULL,
      gmtoffset               int4 NULL,
      lowbatt                 bool NULL,
      "event"                 varchar(100) NULL,
      latitude                float8 NULL,
      longitude               float8 NULL,
      cepradius_km            int4 NULL,
      geom                    public.geometry(point, 4326) NULL,
      temperature             varchar NULL,
      hdop                    varchar NULL,
      numsats                 varchar NULL,
      fixtime                 varchar NULL,
      activity                varchar NULL,
      timeid                  text NOT NULL, -- DEPRECATED: Will be removed in future versions

      CONSTRAINT telemetry_ats_pk PRIMARY KEY (telemetry_ats_id),
      CONSTRAINT telemetry_ats_timeid_un UNIQUE (timeid) -- DEPRECATED: Will be removed in future versions
    );

    ----------------------------------------------------------------------------------------
    -- Create Indexes
    ----------------------------------------------------------------------------------------
    CREATE INDEX telemetry_ats_idx1 ON telemetry_ats(device_key);
    CREATE UNIQUE INDEX telemetry_ats_idx2 ON telemetry_ats(date, collarserialnumber);

    COMMENT ON TABLE telemetry_ats IS 'Raw telemetry data from the ATS API';
    COMMENT ON COLUMN telemetry_ats.telemetry_ats_id IS 'Primary key for telemetry_ats table';
    COMMENT ON COLUMN telemetry_ats.device_key IS 'A generated key for the device make and serial. This is a combination of the device make and the serial number. ie: ats:12345';
    COMMENT ON COLUMN telemetry_ats.collarserialnumber IS 'The serial number printed on the device. Not used as a key.';
    COMMENT ON COLUMN telemetry_ats."date" IS 'The timestamp at which this row was recorded.';
    COMMENT ON COLUMN telemetry_ats.numberfixes IS 'Unknown description. Assumption: Number of GPS fixes obtained to generate this telemetry point.';
    COMMENT ON COLUMN telemetry_ats.battvoltage IS 'Voltage running through main battery of the device at time this row was recorded.';
    COMMENT ON COLUMN telemetry_ats.mortality IS 'Indicates whether the device is reporting that the animal has died or not.';
    COMMENT ON COLUMN telemetry_ats.breakoff IS 'Indicates whether the device is reporting that it has been detached from the animal.';
    COMMENT ON COLUMN telemetry_ats.gpsontime IS 'A number from 0 to 300 representing the length of time in seconds the GPS receiver was on to determine the last location. A zero represents the data status at the end of a fifteen-minute almanac reading.';
    COMMENT ON COLUMN telemetry_ats.satontime IS 'Unknown description. Assumption: the amount of time the collars satellite transmitter was powered on to exchange data.';
    COMMENT ON COLUMN telemetry_ats.saterrors IS 'Unknown description. Assumption: Number of times the device was unable to establish a fix with the satellite.';
    COMMENT ON COLUMN telemetry_ats.gmtoffset IS 'Unknown description. Assumption: Greenwhich Mean Time offset for the date field.';
    COMMENT ON COLUMN telemetry_ats.lowbatt IS 'Indicates whether the device is reporting low battery.';
    COMMENT ON COLUMN telemetry_ats."event" IS 'Unknown description. Assumption: Additional event information that cannot be indicated by the other boolean fields. Note that this just defaults to None.';
    COMMENT ON COLUMN telemetry_ats.latitude IS 'North-South position along surface of the Earth. WGS 84.';
    COMMENT ON COLUMN telemetry_ats.longitude IS 'East-West position along the surface of the Earth. WGS 84.';
    COMMENT ON COLUMN telemetry_ats.cepradius_km IS 'Perhaps circular error probable radius, which would indicate the mean radius about the recorded point that the data could be off by.';
    COMMENT ON COLUMN telemetry_ats.geom IS 'PostGIS human readable geometry point. Created with Latitude and Longitude.';
    COMMENT ON COLUMN telemetry_ats.temperature IS 'Temperature in Celcius';
    COMMENT ON COLUMN telemetry_ats.hdop IS 'Horizontal dilution of precision, another indication of error propagation in satellite tracking.';
    COMMENT ON COLUMN telemetry_ats.numsats IS 'Number of satellites used in achieving GPS fix';
    COMMENT ON COLUMN telemetry_ats.fixtime IS 'Number of seconds needed to achieve GPS fix';
    COMMENT ON COLUMN telemetry_ats.activity IS 'Activity value represents change in the accelerometer value internal to the collar between GPS fixes. Exact numeric meaning varies between models.';
    COMMENT ON COLUMN telemetry_ats.timeid IS 'DEPRECATED: A string combination of the device ID and recorded timestamp';

    ----------------------------------------------------------------------------------------
    -- Add triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_telemetry_ats BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_ats FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_ats AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_ats FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Create telemetry_vectronic Table
    ----------------------------------------------------------------------------------------
    CREATE TABLE telemetry_vectronic (
    telemetry_vectronic_id        UUID DEFAULT public.gen_random_uuid() NOT NULL,
    device_key                    VARCHAR GENERATED ALWAYS AS ('vectronic:' || idcollar::text) STORED,

    idposition                    INT4 NOT NULL,
    idcollar                      INT4 NOT NULL,
    acquisitiontime               TIMESTAMPTZ NULL,
    scts                          TIMESTAMPTZ NULL,
    origincode                    TEXT NULL,
    ecefx                         FLOAT8 NULL,
    ecefy                         FLOAT8 NULL,
    ecefz                         FLOAT8 NULL,
    latitude                      FLOAT8 NULL,
    longitude                     FLOAT8 NULL,
    height                        FLOAT8 NULL,
    dop                           FLOAT8 NULL,
    idfixtype                     INT4 NULL,
    positionerror                 FLOAT8 NULL,
    satcount                      INT4 NULL,
    ch01satid                     INT4 NULL,
    ch01satcnr                    INT4 NULL,
    ch02satid                     INT4 NULL,
    ch02satcnr                    INT4 NULL,
    ch03satid                     INT4 NULL,
    ch03satcnr                    INT4 NULL,
    ch04satid                     INT4 NULL,
    ch04satcnr                    INT4 NULL,
    ch05satid                     INT4 NULL,
    ch05satcnr                    INT4 NULL,
    ch06satid                     INT4 NULL,
    ch06satcnr                    INT4 NULL,
    ch07satid                     INT4 NULL,
    ch07satcnr                    INT4 NULL,
    ch08satid                     INT4 NULL,
    ch08satcnr                    INT4 NULL,
    ch09satid                     INT4 NULL,
    ch09satcnr                    INT4 NULL,
    ch10satid                     INT4 NULL,
    ch10satcnr                    INT4 NULL,
    ch11satid                     INT4 NULL,
    ch11satcnr                    INT4 NULL,
    ch12satid                     INT4 NULL,
    ch12satcnr                    INT4 NULL,
    idmortalitystatus             INT4 NULL,
    activity                      INT4 NULL,
    mainvoltage                   FLOAT8 NULL,
    backupvoltage                 FLOAT8 NULL,
    temperature                   FLOAT8 NULL,
    transformedx                  FLOAT8 NULL,
    transformedy                  FLOAT8 NULL,
    geom                          public.geometry(point, 4326) NULL,

    CONSTRAINT telemetry_vectronic_pk PRIMARY KEY (telemetry_vectronic_id),
    CONSTRAINT telemetry_vectronic_idposition_un UNIQUE (idposition)
    );

    ----------------------------------------------------------------------------------------
    -- Create Indexes
    ----------------------------------------------------------------------------------------
    CREATE INDEX vectronics_collar_data_idx1 ON telemetry_vectronic(device_key);
    CREATE INDEX vectronics_collar_data_idx2 ON telemetry_vectronic USING gist (geom);

    COMMENT ON TABLE telemetry_vectronic IS 'The raw telemetry data from Vectronics API';
    COMMENT ON COLUMN telemetry_vectronic.telemetry_vectronic_id IS 'Primary key for telemetry_vectronic table';
    COMMENT ON COLUMN telemetry_vectronic.device_key IS 'A generated key for the device make and serial number ie: vectronic:12345';
    COMMENT ON COLUMN telemetry_vectronic.idposition IS 'acts as the primary key of the table, this is a vectronic database identifier';
    COMMENT ON COLUMN telemetry_vectronic.idcollar IS 'Vectronic device ID';
    COMMENT ON COLUMN telemetry_vectronic.acquisitiontime IS 'Timestamp from the device marking when the record was recorded';
    COMMENT ON COLUMN telemetry_vectronic.scts IS 'SCTS - Service Center Timestamp. Timestamp when the record was received by the service center.';
    COMMENT ON COLUMN telemetry_vectronic.origincode IS 'Code to identify the origin of this record. I - Iridium, G - Globalstar, S - GSM SMS, F- GSM FTP, C - Collar, A - Argos, T - Terminal, 0 - Unknown';
    COMMENT ON COLUMN telemetry_vectronic.ecefx IS 'Earth Centered Earth Fixed X direction is the cartesian coordinate where the origin is the center of the earth. The x direction is the intersection of the prime meridian with the equator.';
    COMMENT ON COLUMN telemetry_vectronic.ecefy IS 'Earth Centered Earth Fixed Y direction is the cartesian coordinate where the origin is the center of the earth.';
    COMMENT ON COLUMN telemetry_vectronic.ecefz IS 'Earth Centered Earth Fixed Z direction is the cartesian coordinate where the origin is the center of the earth. The z direction is the intersection from the center of the earth to the north pole.';
    COMMENT ON COLUMN telemetry_vectronic.latitude IS 'North-South position along surface of the Earth. WGS 84.';
    COMMENT ON COLUMN telemetry_vectronic.longitude IS 'East-West position along the surface of the Earth. WGS 84.';
    COMMENT ON COLUMN telemetry_vectronic.height IS 'WGS 84 Height.';
    COMMENT ON COLUMN telemetry_vectronic.dop IS 'Dilution of precision.';
    COMMENT ON COLUMN telemetry_vectronic.idfixtype IS 'Code value for the GPS fixtype. 0 - No Fix, 10 - GPS-1 Sat, 11 - GPS-2 Sat, 12 - GPS-2D, 13 - GPS-3D, 14 - val. GPS-3D, 1 - Argos-Z, 2 -Argos-B, 3 - Argos-A, 4 - Argos-0, 5 - Argos-1, 6 - Argos-2, 7 - Argos-3';
    COMMENT ON COLUMN telemetry_vectronic.positionerror IS 'No description provided by vendor.';
    COMMENT ON COLUMN telemetry_vectronic.satcount IS 'Amount of visible satellites.';
    COMMENT ON COLUMN telemetry_vectronic.ch01satid IS 'Satellite ID of Channel 1';
    COMMENT ON COLUMN telemetry_vectronic.ch01satcnr IS 'Satellite CNR of Channel 1';
    COMMENT ON COLUMN telemetry_vectronic.ch02satid IS 'Satellite ID of Channel 2';
    COMMENT ON COLUMN telemetry_vectronic.ch02satcnr IS 'Satellite CNR of Channel 2';
    COMMENT ON COLUMN telemetry_vectronic.ch03satid IS 'Satellite ID of Channel 3';
    COMMENT ON COLUMN telemetry_vectronic.ch03satcnr IS 'Satellite CNR of Channel 3';
    COMMENT ON COLUMN telemetry_vectronic.ch04satid IS 'Satellite ID of Channel 4';
    COMMENT ON COLUMN telemetry_vectronic.ch04satcnr IS 'Satellite CNR of Channel 4';
    COMMENT ON COLUMN telemetry_vectronic.ch05satid IS 'Satellite ID of Channel 5';
    COMMENT ON COLUMN telemetry_vectronic.ch05satcnr IS 'Satellite CNR of Channel 5';
    COMMENT ON COLUMN telemetry_vectronic.ch06satid IS 'Satellite ID of Channel 6';
    COMMENT ON COLUMN telemetry_vectronic.ch06satcnr IS 'Satellite CNR of Channel 6';
    COMMENT ON COLUMN telemetry_vectronic.ch07satid IS 'Satellite ID of Channel 7';
    COMMENT ON COLUMN telemetry_vectronic.ch07satcnr IS 'Satellite CNR of Channel 7';
    COMMENT ON COLUMN telemetry_vectronic.ch08satid IS 'Satellite ID of Channel 8';
    COMMENT ON COLUMN telemetry_vectronic.ch08satcnr IS 'Satellite CNR of Channel 8';
    COMMENT ON COLUMN telemetry_vectronic.ch09satid IS 'Satellite ID of Channel 9';
    COMMENT ON COLUMN telemetry_vectronic.ch09satcnr IS 'Satellite CNR of Channel 9';
    COMMENT ON COLUMN telemetry_vectronic.ch10satid IS 'Satellite ID of Channel 10';
    COMMENT ON COLUMN telemetry_vectronic.ch10satcnr IS 'Satellite CNR of Channel 10';
    COMMENT ON COLUMN telemetry_vectronic.ch11satid IS 'Satellite ID of Channel 11';
    COMMENT ON COLUMN telemetry_vectronic.ch11satcnr IS 'Satellite CNR of Channel 11';
    COMMENT ON COLUMN telemetry_vectronic.ch12satid IS 'Satellite ID of Channel 12';
    COMMENT ON COLUMN telemetry_vectronic.ch12satcnr IS 'Satellite CNR of Channel 12';
    COMMENT ON COLUMN telemetry_vectronic.idmortalitystatus IS 'Code value of mortality status.';
    COMMENT ON COLUMN telemetry_vectronic.activity IS 'No description provided by vendor.';
    COMMENT ON COLUMN telemetry_vectronic.mainvoltage IS 'Voltage indicator of main battery.';
    COMMENT ON COLUMN telemetry_vectronic.backupvoltage IS 'Voltage indicator of backup / beacon battery.';
    COMMENT ON COLUMN telemetry_vectronic.temperature IS 'Devices temperature reading in Celsius.';
    COMMENT ON COLUMN telemetry_vectronic.transformedx IS 'No description provided by vendor.';
    COMMENT ON COLUMN telemetry_vectronic.transformedy IS 'No description provided by vendor.';
    COMMENT ON COLUMN telemetry_vectronic.geom IS 'Telemetry collected by device.';

    ----------------------------------------------------------------------------------------
    -- Add triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_telemetry_vectronic BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_vectronic FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_vectronic AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_vectronic FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Create telemetry_lotek Table
    ----------------------------------------------------------------------------------------
    CREATE TABLE telemetry_lotek (
    telemetry_lotek_id            UUID DEFAULT public.gen_random_uuid() NOT NULL,
    device_key                    VARCHAR GENERATED ALWAYS AS ('lotek:' || deviceid::text) STORED,

    channelstatus                 TEXT NULL,
    uploadtimestamp               TIMESTAMPTZ NULL,
    latitude                      FLOAT8 NULL,
    longitude                     FLOAT8 NULL,
    altitude                      FLOAT8 NULL,
    ecefx                         FLOAT8 NULL,
    ecefy                         FLOAT8 NULL,
    ecefz                         FLOAT8 NULL,
    rxstatus                      INT4 NULL,
    pdop                          FLOAT8 NULL,
    mainv                         FLOAT8 NULL,
    bkupv                         FLOAT8 NULL,
    temperature                   FLOAT8 NULL,
    fixduration                   INT4 NULL,
    bhastempvoltage               BOOL NULL,
    devname                       TEXT NULL,
    deltatime                     FLOAT8 NULL,
    fixtype                       TEXT NULL,
    cepradius                     FLOAT8 NULL,
    crc                           FLOAT8 NULL,
    deviceid                      INT4 NULL,
    recdatetime                   TIMESTAMPTZ NULL,
    geom                          public.geometry(point, 4326) NULL,

    CONSTRAINT telemetry_lotek_pk PRIMARY KEY (telemetry_lotek_id)
    );

    ----------------------------------------------------------------------------------------
    -- Create Indexes
    ----------------------------------------------------------------------------------------
    CREATE INDEX telemetry_lotek_idx1 ON telemetry_lotek(device_key);
    CREATE INDEX telemetry_lotek_idx2 ON telemetry_lotek USING gist (geom);

    COMMENT ON TABLE telemetry_lotek IS 'The raw telemetry data from Lotek';
    COMMENT ON COLUMN telemetry_lotek.telemetry_lotek_id IS 'Primary key for telemetry_lotek table';
    COMMENT ON COLUMN telemetry_lotek.device_key IS 'A generated key for the device make and serial number ie: lotek:12345';
    COMMENT ON COLUMN telemetry_lotek.channelstatus IS 'Unknown description';
    COMMENT ON COLUMN telemetry_lotek.uploadtimestamp IS 'Datetime of Iridium Upload in GMT';
    COMMENT ON COLUMN telemetry_lotek.latitude IS 'North-south position on the surface of the earth that this device transmitted from';
    COMMENT ON COLUMN telemetry_lotek.longitude IS 'East-west position on the surface of the earth that this device transmitted from';
    COMMENT ON COLUMN telemetry_lotek.altitude IS 'Vertical height in meters, calculated as Height Above Ellipsoid (HAE)';
    COMMENT ON COLUMN telemetry_lotek.ecefx IS 'Activity data for X axis; only applicable to certain collar models';
    COMMENT ON COLUMN telemetry_lotek.ecefy IS 'Activity data for Y axis; only applicable to certain collar models';
    COMMENT ON COLUMN telemetry_lotek.ecefz IS 'Activity data for Z axis; only applicable to certain collar models';
    COMMENT ON COLUMN telemetry_lotek.rxstatus IS 'Unknown description';
    COMMENT ON COLUMN telemetry_lotek.pdop IS 'Positional Dilution of Precision; see https://gisgeography.com/gps-accuracyhdop-pdop-gdop-multipath/';
    COMMENT ON COLUMN telemetry_lotek.mainv IS 'Voltage of main battery; only present with certain collar models';
    COMMENT ON COLUMN telemetry_lotek.bkupv IS 'Voltage of backup battery; only present with certain collar models';
    COMMENT ON COLUMN telemetry_lotek.temperature IS 'Temperature in Celcius';
    COMMENT ON COLUMN telemetry_lotek.fixduration IS 'Time taken for GPS fix attempt; only present with certain collar models';
    COMMENT ON COLUMN telemetry_lotek.bhastempvoltage IS 'Does the collar record both temperature and voltage? Only present with certain collar models';
    COMMENT ON COLUMN telemetry_lotek.devname IS 'User-assigned name for the collar; this setting is configured on Web Servic';
    COMMENT ON COLUMN telemetry_lotek.deltatime IS 'Applies to Swift Fix collars only; the difference between the satellite time and the time of the clock on-board the collar';
    COMMENT ON COLUMN telemetry_lotek.fixtype IS 'Numeric indicator to differentiate between IridiumTrack, Litetrack and Swift Fix collars';
    COMMENT ON COLUMN telemetry_lotek.cepradius IS 'Applies to Swift Fix collars only; Circular Error Probable for location data';
    COMMENT ON COLUMN telemetry_lotek.crc IS 'Applies to Swift Fix collars only; pertains to the handling of location data';
    COMMENT ON COLUMN telemetry_lotek.deviceid IS 'the Lotek device ID';
    COMMENT ON COLUMN telemetry_lotek.recdatetime IS 'timestamp the telemetry was recorded';
    COMMENT ON COLUMN telemetry_lotek.geom IS 'PostGIS human readable geometry point. Created with Latitude and Longitude.';

    ----------------------------------------------------------------------------------------
    -- Add triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_telemetry_lotek BEFORE INSERT OR UPDATE OR DELETE ON biohub.telemetry_lotek FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_telemetry_lotek AFTER INSERT OR UPDATE OR DELETE ON biohub.telemetry_lotek FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Create device make table
    ----------------------------------------------------------------------------------------
    CREATE TABLE device_make (
      device_make_id                                integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(128),
      record_effective_date                         timestamptz(6)     NOT NULL,
      record_end_date                               timestamptz(6),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,

      CONSTRAINT device_make_id_name_composite_pk PRIMARY KEY (device_make_id, name) -- Composite foreign key
    );

    COMMENT ON TABLE device_make IS 'This table is intended to store options that users can select for their device make.';
    COMMENT ON COLUMN device_make.device_make_id IS 'Composite primary key (id) for device make.';
    COMMENT ON COLUMN device_make.name IS 'Composite primary key (name) of the device make option.';
    COMMENT ON COLUMN device_make.description IS 'Description of the device make option.';
    COMMENT ON COLUMN device_make.record_effective_date IS 'Start date of the device make option.';
    COMMENT ON COLUMN device_make.record_end_date IS 'End date of the device make option.';
    COMMENT ON COLUMN device_make.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN device_make.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN device_make.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN device_make.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN device_make.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Add triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_device_make BEFORE INSERT OR UPDATE OR DELETE ON biohub.device_make FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_device_make AFTER INSERT OR UPDATE OR DELETE ON biohub.device_make FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Add initial values to device make table
    ----------------------------------------------------------------------------------------
    INSERT INTO device_make (name, description, record_effective_date) VALUES
    ('vectronic', 'VECTRONIC', 'NOW()'),
    ('lotek', 'LOTEK', 'NOW()'),
    ('ats', 'ATS', 'NOW()'),
    ('followit', 'FOLLOWIT', 'NOW()'),
    ('televit', 'TELEVIT', 'NOW()'),
    ('teleonics', 'TELEONICS', 'NOW()');

    ----------------------------------------------------------------------------------------
    -- Create frequency table
    ----------------------------------------------------------------------------------------
    CREATE TABLE deployment_frequency (
      deployment_frequency_id                           integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      name                                          varchar(32)        NOT NULL,
      description                                   varchar(128),
      record_effective_date                         timestamptz(6)     NOT NULL,
      record_end_date                               timestamptz(6),
      create_date                                   timestamptz(6)     DEFAULT now() NOT NULL,
      create_user                                   integer            NOT NULL,
      update_date                                   timestamptz(6),
      update_user                                   integer,
      revision_count                                integer            DEFAULT 0 NOT NULL,

      CONSTRAINT deployment_frequency_id_pk PRIMARY KEY (deployment_frequency_id)
    );

    COMMENT ON TABLE  deployment_frequency IS 'This table is intended to store options that users can select for their deployment freqency.';
    COMMENT ON COLUMN deployment_frequency.deployment_frequency_id IS 'Primary key for deployment frequency.';
    COMMENT ON COLUMN deployment_frequency.name IS 'Name of the deployment frequency option.';
    COMMENT ON COLUMN deployment_frequency.description IS 'Description of the deployment frequency option.';
    COMMENT ON COLUMN deployment_frequency.record_effective_date IS 'Start date of the deployment frequency option.';
    COMMENT ON COLUMN deployment_frequency.record_end_date IS 'End date of the deployment frequency option.';
    COMMENT ON COLUMN deployment_frequency.create_date IS 'The datetime the record was created.';
    COMMENT ON COLUMN deployment_frequency.create_user IS 'The id of the user who created the record as identified in the system user table.';
    COMMENT ON COLUMN deployment_frequency.update_date IS 'The datetime the record was updated.';
    COMMENT ON COLUMN deployment_frequency.update_user IS 'The id of the user who updated the record as identified in the system user table.';
    COMMENT ON COLUMN deployment_frequency.revision_count IS 'Revision count used for concurrency control.';

    ----------------------------------------------------------------------------------------
    -- Add triggers
    ----------------------------------------------------------------------------------------
    CREATE TRIGGER audit_deployment_frequency BEFORE INSERT OR UPDATE OR DELETE ON biohub.deployment_frequency FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_deployment_frequency AFTER INSERT OR UPDATE OR DELETE ON biohub.deployment_frequency FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();

    ----------------------------------------------------------------------------------------
    -- Add initial values to deployment frequency table
    ----------------------------------------------------------------------------------------
    INSERT INTO deployment_frequency (name, description, record_effective_date) VALUES
    ('khz', 'KHz', 'NOW()'),
    ('mhz', 'MHz', 'NOW()'),
    ('hz', 'Hz', 'NOW()');

    ----------------------------------------------------------------------------------------
    -- Create Views
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    CREATE OR REPLACE VIEW telemetry_ats as SELECT * FROM biohub.telemetry_ats;
    CREATE OR REPLACE VIEW telemetry_vectronic as SELECT * FROM biohub.telemetry_vectronic;
    CREATE OR REPLACE VIEW telemetry_lotek as SELECT * FROM biohub.telemetry_lotek;
    CREATE OR REPLACE VIEW device_make as SELECT * FROM biohub.device_make;
    CREATE OR REPLACE VIEW deployment_frequency as SELECT * FROM biohub.deployment_frequency;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
