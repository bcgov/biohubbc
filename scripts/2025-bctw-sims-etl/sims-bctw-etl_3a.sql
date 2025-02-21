drop table if exists bctw.matched_sims_deployments cascade;

drop table if exists bctw.matched_collar cascade;
drop table if exists bctw.matched_deployment cascade;

drop table if exists sims_bctw.matched_device cascade;
drop table if exists sims_bctw.matched_deployment cascade;

------------------------------------------------------------
-- bctw
------------------------------------------------------------

-- Existing sims deployment records that have a matching bctw deployment record
CREATE TABLE if not exists bctw.matched_sims_deployments (
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

-- All valid BCTW collar records
CREATE TABLE if not exists bctw.matched_collar (
    matched_collar_id            INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    matched_collar_deployment_id INTEGER,
    --
    sims_survey_id               INTEGER,
    --
    bctw_collar_uuid             UUID,
    --
    device_id                    VARCHAR(64),
    device_make                  VARCHAR(255),
    device_model                 VARCHAR(255),
    comment                      TEXT,
    --
    create_date                  timestamptz(6),
    create_user                  integer,
    update_date                  timestamptz(6),
    update_user                  integer
);

-- All valid BCTW deployment records
CREATE TABLE if not exists bctw.matched_deployment (
    matched_deployment_id           INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    matched_collar_deployment_id    INTEGER,
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
    create_date                     timestamptz(6),
    create_user                     integer,
    update_date                     timestamptz(6),
    update_user                     integer
);

------------------------------------------------------------
-- sims_bctw
------------------------------------------------------------

-- Device records for the sims deployments that had matching BCTW deployments
CREATE TABLE if not exists sims_bctw.matched_device (
    matched_device_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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

-- Deployment records for the sims deployments that had matching BCTW deployments
CREATE TABLE if not exists sims_bctw.matched_deployment (
    matched_deployment_id        INTEGER        GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    matched_device_id            INTEGER,
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
