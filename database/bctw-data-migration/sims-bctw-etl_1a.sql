drop table if exists bctw.valid_collar_deployment cascade;
drop table if exists bctw.invalid_collar_deployment cascade;

------------------------------------------------------------
-- bctw
------------------------------------------------------------

-- A flattened table of BCTW deployments and collars, that are both valid
CREATE TABLE if not exists bctw.valid_collar_deployment (
    valid_collar_deployment_id               INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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

-- A flattened table of BCTW deployments and collars, that are NOT both valid
CREATE TABLE if not exists bctw.invalid_collar_deployment (
    valid_collar_deployment_id        INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
