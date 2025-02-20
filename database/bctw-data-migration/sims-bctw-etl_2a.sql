drop table if exists bctw.sims_mismatched_deployments cascade;

drop table if exists bctw.mismatched_collar_deployment cascade;
drop table if exists bctw.mismatched_collar cascade;
drop table if exists bctw.mismatched_deployment cascade;

drop table if exists bctw.invalid_mismatched_collar_deployment cascade;

drop table if exists sims_bctw.mismatched_device cascade;
drop table if exists sims_bctw.mismatched_deployment cascade;

------------------------------------------------------------
-- bctw
------------------------------------------------------------

-- Existing sims deployment records that do not have a matching bctw deployment record
CREATE TABLE if not exists bctw.sims_mismatched_deployments (
    survey_id                       integer,
    deployment_id                   integer,
    critter_id                      integer,
    critterbase_critter_id          uuid,
    bctw_deployment_id              uuid,
    create_date                     timestamptz(6),              
    create_user                     integer,
    update_date                     timestamptz(6),
    update_user                     integer,
    revision_count                  integer,
    critterbase_start_capture_id    uuid,
    critterbase_end_capture_id      uuid,
    critterbase_end_mortality_id    uuid
);

------------------------------------------------------------
-- bctw
------------------------------------------------------------

-- A flattened table of BCTW deployments and collars, that are both valid
CREATE TABLE if not exists bctw.mismatched_collar_deployment (
    mismatched_collar_deployment_id               INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    --
    bctw_deployment_uuid                   UUID[],
    --
    bctw_collar_uuid                       UUID[],
    --
    bctw_critter_uuid                      UUID[],
    --
    device_id                              VARCHAR(64),
    device_make                            VARCHAR(255)[],
    device_model                           VARCHAR(255)[],
    comment                                TEXT[],
    frequency                              DECIMAL[],
    frequency_unit                         VARCHAR(50)[],
    attachment_start                       TIMESTAMP,
    attachment_end                         TIMESTAMP[],
    --
    collar_created_at                      timestamptz(6)[],
    collar_created_by                      integer[],
    collar_updated_at                      timestamptz(6)[],
    collar_updated_by                      integer[],
    collar_valid_to                        timestamptz(6)[],
    --
    collar_animal_assignment_created_at    timestamptz(6)[],
    collar_animal_assignment_created_by    integer[],
    collar_animal_assignment_updated_at    timestamptz(6)[],
    collar_animal_assignment_updated_by    integer[],
    collar_animal_assignment_valid_to      timestamptz(6)[],
    --
    internal_is_valid                      boolean
);

-- All valid BCTW collar records
CREATE TABLE if not exists bctw.mismatched_collar (
    mismatched_collar_id            INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    mismatched_collar_deployment_id INTEGER,
    --
    sims_survey_id           INTEGER,
    --
    bctw_collar_uuid         UUID,
    --
    device_id                VARCHAR(64),
    device_make              VARCHAR(255),
    device_model             VARCHAR(255),
    comment                  TEXT,
    --
    create_date              timestamptz(6),
    create_user              integer,
    update_date              timestamptz(6),
    update_user              integer
);

-- All valid BCTW deployment records
CREATE TABLE if not exists bctw.mismatched_deployment (
    mismatched_deployment_id               INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    mismatched_collar_deployment_id        INTEGER,
    --
    sims_survey_id                  INTEGER,
    --
    bctw_deployment_uuid            UUID,
    --
    bctw_critter_uuid               UUID,
    --
    attachment_start                TIMESTAMP,
    attachment_end                  TIMESTAMP,
    frequency                       DECIMAL,
    frequency_unit                  VARCHAR(50),
    --
    critterbase_start_capture_id    uuid,
    critterbase_end_capture_id      uuid,
    critterbase_end_mortality_id    uuid,
    ---
    create_date                     timestamptz(6),
    create_user                     integer,
    update_date                     timestamptz(6),
    update_user                     integer
);

-- A flattened table of BCTW deployments and collars, that are not both valid
CREATE TABLE if not exists bctw.invalid_mismatched_collar_deployment (
    mismatched_collar_deployment_id        INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    --
    bctw_deployment_uuid                   UUID[],
    --
    bctw_collar_uuid                       UUID[],
    --
    bctw_critter_uuid                      UUID[],
    --
    device_id                              VARCHAR(64),
    device_make                            VARCHAR(255)[],
    device_model                           VARCHAR(255)[],
    comment                                TEXT[],
    frequency                              DECIMAL[],
    frequency_unit                         VARCHAR(50)[],
    attachment_start                       TIMESTAMP,
    attachment_end                         TIMESTAMP[],
    --
    collar_created_at                      timestamptz(6)[],
    collar_created_by                      integer[],
    collar_updated_at                      timestamptz(6)[],
    collar_updated_by                      integer[],
    collar_valid_to                        timestamptz(6)[],
    --
    collar_animal_assignment_created_at    timestamptz(6)[],
    collar_animal_assignment_created_by    integer[],
    collar_animal_assignment_updated_at    timestamptz(6)[],
    collar_animal_assignment_updated_by    integer[],
    collar_animal_assignment_valid_to      timestamptz(6)[],
    --
    internal_is_valid                      boolean
);

------------------------------------------------------------
-- sims_bctw
------------------------------------------------------------

-- Device records for the sims deployments that did not have matching BCTW deployments
CREATE TABLE if not exists sims_bctw.mismatched_device (
    mismatched_device_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    --
    survey_id           INTEGER,
    --
    device_key          VARCHAR,
    --
    serial              VARCHAR,
    device_make_id      INTEGER,
    model               VARCHAR(100),
    comment             VARCHAR(250)
);

-- Deployment records for the sims deployments that did not have matching BCTW deployments
CREATE TABLE if not exists sims_bctw.mismatched_deployment (
    mismatched_deployment_id        INTEGER        GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    mismatched_device_id            INTEGER,
    --
    survey_id                       INTEGER,
    --
    critter_id                      INTEGER,
    --
    device_id                       INTEGER,
    device_key                      VARCHAR,
    --
    frequency                       DECIMAL,
    frequency_unit_id               INTEGER,
    --
    attachment_start_date           DATE,
    attachment_start_time           TIME,
    attachment_end_date             DATE,
    attachment_end_time             TIME,
    --
    critterbase_start_capture_id    UUID,
    critterbase_end_capture_id      UUID,
    critterbase_end_mortality_id    UUID
);


