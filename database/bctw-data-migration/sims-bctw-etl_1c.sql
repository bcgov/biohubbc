drop table if exists bctw.invalid_collar_deployment cascade;
drop table if exists bctw.invalid_collar_valid_deployment cascade;
drop table if exists bctw.valid_collar_invalid_deployment cascade;
drop table if exists bctw.flattened_invalid_collar_deployment cascade;
drop table if exists bctw.flattened_invalid_collar_valid_deployment cascade;
drop table if exists bctw.flattened_valid_collar_invalid_deployment cascade;

------------------------------------------------------------
-- bctw invalid tables
------------------------------------------------------------

-- A array_agg table of BCTW deployments and collars, that are NOT both valid
CREATE TABLE if not exists bctw.invalid_collar_deployment (
    valid_collar_deployment_id             INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
    internal_is_valid                      boolean          default false
);

-- A array_agg table of BCTW deployments and collars, where deployment is valid and collar is not valid
CREATE TABLE if not exists bctw.invalid_collar_valid_deployment (
    valid_collar_deployment_id             INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
    internal_is_valid                      boolean          default false
);

-- A array_agg table of BCTW deployments and collars, where deployment is invalid and collar is valid
CREATE TABLE if not exists bctw.valid_collar_invalid_deployment (
    valid_collar_deployment_id             INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
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
    internal_is_valid                      boolean          default false
);

-- A flattened table of BCTW deployments and collars, that are both invalid
CREATE TABLE if not exists bctw.flattened_invalid_collar_deployment (
    bctw_deployment_uuid                   UUID,
    --
    bctw_collar_uuid                       UUID,
    --
    bctw_critter_uuid                      UUID,
    --
    device_id                              VARCHAR(64),
    device_make                            VARCHAR(255),
    device_model                           VARCHAR(255),
    comment                                TEXT,
    frequency                              DECIMAL,
    frequency_unit                         VARCHAR(50),
    attachment_start                       TIMESTAMP,
    attachment_end                         TIMESTAMP,
    --
    collar_created_at                      timestamptz(6),
    collar_created_by                      integer,
    collar_updated_at                      timestamptz(6),
    collar_updated_by                      integer,
    collar_valid_to                        timestamptz(6),
    --
    collar_animal_assignment_created_at    timestamptz(6),
    collar_animal_assignment_created_by    integer,
    collar_animal_assignment_updated_at    timestamptz(6),
    collar_animal_assignment_updated_by    integer,
    collar_animal_assignment_valid_to      timestamptz(6),
    --
    internal_is_valid                      boolean          default false
);


-- A flattened table of BCTW deployments and collars
CREATE TABLE if not exists bctw.flattened_invalid_collar_valid_deployment (
    bctw_deployment_uuid                   UUID,
    --
    bctw_collar_uuid                       UUID,
    --
    bctw_critter_uuid                      UUID,
    --
    device_id                              VARCHAR(64),
    device_make                            VARCHAR(255),
    device_model                           VARCHAR(255),
    comment                                TEXT,
    frequency                              DECIMAL,
    frequency_unit                         VARCHAR(50),
    attachment_start                       TIMESTAMP,
    attachment_end                         TIMESTAMP,
    --
    collar_created_at                      timestamptz(6),
    collar_created_by                      integer,
    collar_updated_at                      timestamptz(6),
    collar_updated_by                      integer,
    collar_valid_to                        timestamptz(6),
    --
    collar_animal_assignment_created_at    timestamptz(6),
    collar_animal_assignment_created_by    integer,
    collar_animal_assignment_updated_at    timestamptz(6),
    collar_animal_assignment_updated_by    integer,
    collar_animal_assignment_valid_to      timestamptz(6),
    --
    internal_is_valid                      boolean          default false
);


-- A flattened table of BCTW deployments and collars
CREATE TABLE if not exists bctw.flattened_valid_collar_invalid_deployment (
    bctw_deployment_uuid                   UUID,
    --
    bctw_collar_uuid                       UUID,
    --
    bctw_critter_uuid                      UUID,
    --
    device_id                              VARCHAR(64),
    device_make                            VARCHAR(255),
    device_model                           VARCHAR(255),
    comment                                TEXT,
    frequency                              DECIMAL,
    frequency_unit                         VARCHAR(50),
    attachment_start                       TIMESTAMP,
    attachment_end                         TIMESTAMP,
    --
    collar_created_at                      timestamptz(6),
    collar_created_by                      integer,
    collar_updated_at                      timestamptz(6),
    collar_updated_by                      integer,
    collar_valid_to                        timestamptz(6),
    --
    collar_animal_assignment_created_at    timestamptz(6),
    collar_animal_assignment_created_by    integer,
    collar_animal_assignment_updated_at    timestamptz(6),
    collar_animal_assignment_updated_by    integer,
    collar_animal_assignment_valid_to      timestamptz(6),
    --
    internal_is_valid                      boolean          default false
);

--------------------------------------------------------------------------------------------------------------
-- Populate invalid_collar_deployment table
--------------------------------------------------------------------------------------------------------------

with w_valid_collar_deployment as (
    select
        (array_remove(array_agg(distinct collar_animal_assignment.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct collar_animal_assignment.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct collar.collar_id), null)) AS bctw_collar_uuid,
        --
        collar.device_id,
        (array_remove(array_agg(distinct collar.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_model) FILTER (WHERE collar.device_model IS NOT NULL AND collar.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT CONCAT_WS('; ', '2025: BCTW -> SIMS Data Migration', collar.device_comment, collar.malfunction_comment)) FILTER (WHERE (collar.device_comment IS NOT NULL AND collar.device_comment != '') or (collar.malfunction_comment IS NOT NULL AND collar.malfunction_comment != '')), '')) AS comment,
        (array_remove(array_agg(distinct collar.frequency), null)) AS frequency,
        (array_remove(array_agg(distinct collar.frequency_unit), null)) AS frequency_unit,
        --
        attachment_start,
        (array_remove(array_agg(distinct collar_animal_assignment.attachment_end), null)) AS attachment_end,
        --
        (array_remove(array_agg(distinct collar.created_at), null)) AS collar_created_at,
        (array_remove(array_agg(distinct collar.created_by_user_id), null)) AS collar_created_by,
        (array_remove(array_agg(distinct collar.updated_at), null)) AS collar_updated_at,
        (array_remove(array_agg(distinct collar.updated_by_user_id), null)) AS collar_updated_by,
                     (array_agg(distinct collar.valid_to)) AS collar_valid_to,
        --
        (array_remove(array_agg(distinct collar_animal_assignment.created_at), null)) AS collar_animal_assignment_created_at,
        (array_remove(array_agg(distinct collar_animal_assignment.created_by_user_id), null)) AS collar_animal_assignment_created_by,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_at), null)) AS collar_animal_assignment_updated_at,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_by_user_id), null)) AS collar_animal_assignment_updated_by,
                     (array_agg(distinct collar_animal_assignment.valid_to)) AS collar_animal_assignment_valid_to
    FROM
        bctw.collar_animal_assignment
    JOIN
        bctw.collar ON collar.collar_id = collar_animal_assignment.collar_id
    where
        -- Select records where the deployment is invalid and the collar is invalid
        not bctw.is_valid(collar_animal_assignment.valid_to) and
        not bctw.is_valid(collar.valid_to)
    GROUP BY
        attachment_start, device_id, device_make
)
INSERT INTO bctw.invalid_collar_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_valid_collar_deployment;


--------------------------------------------------------------------------------------------------------------
-- Populate invalid_collar_valid_deployment table
--------------------------------------------------------------------------------------------------------------

with w_valid_collar_deployment as (
    select
        (array_remove(array_agg(distinct collar_animal_assignment.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct collar_animal_assignment.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct collar.collar_id), null)) AS bctw_collar_uuid,
        --
        collar.device_id,
        (array_remove(array_agg(distinct collar.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_model) FILTER (WHERE collar.device_model IS NOT NULL AND collar.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT CONCAT_WS('; ', '2025: BCTW -> SIMS Data Migration', collar.device_comment, collar.malfunction_comment)) FILTER (WHERE (collar.device_comment IS NOT NULL AND collar.device_comment != '') or (collar.malfunction_comment IS NOT NULL AND collar.malfunction_comment != '')), '')) AS comment,
        (array_remove(array_agg(distinct collar.frequency), null)) AS frequency,
        (array_remove(array_agg(distinct collar.frequency_unit), null)) AS frequency_unit,
        --
        attachment_start,
        (array_remove(array_agg(distinct collar_animal_assignment.attachment_end), null)) AS attachment_end,
        --
        (array_remove(array_agg(distinct collar.created_at), null)) AS collar_created_at,
        (array_remove(array_agg(distinct collar.created_by_user_id), null)) AS collar_created_by,
        (array_remove(array_agg(distinct collar.updated_at), null)) AS collar_updated_at,
        (array_remove(array_agg(distinct collar.updated_by_user_id), null)) AS collar_updated_by,
                     (array_agg(distinct collar.valid_to)) AS collar_valid_to,
        --
        (array_remove(array_agg(distinct collar_animal_assignment.created_at), null)) AS collar_animal_assignment_created_at,
        (array_remove(array_agg(distinct collar_animal_assignment.created_by_user_id), null)) AS collar_animal_assignment_created_by,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_at), null)) AS collar_animal_assignment_updated_at,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_by_user_id), null)) AS collar_animal_assignment_updated_by,
                     (array_agg(distinct collar_animal_assignment.valid_to)) AS collar_animal_assignment_valid_to
    FROM
        bctw.collar_animal_assignment
    JOIN
        bctw.collar ON collar.collar_id = collar_animal_assignment.collar_id
    where
        -- select records where the deployment is valid but the collar is not
        bctw.is_valid(collar_animal_assignment.valid_to) and
        not bctw.is_valid(collar.valid_to)
    GROUP BY
        attachment_start, device_id, device_make
)
INSERT INTO bctw.invalid_collar_valid_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_valid_collar_deployment;


--------------------------------------------------------------------------------------------------------------
-- Populate valid_collar_invalid_deployment table
--------------------------------------------------------------------------------------------------------------

with w_valid_collar_deployment as (
    select
        (array_remove(array_agg(distinct collar_animal_assignment.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct collar_animal_assignment.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct collar.collar_id), null)) AS bctw_collar_uuid,
        --
        collar.device_id,
        (array_remove(array_agg(distinct collar.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_model) FILTER (WHERE collar.device_model IS NOT NULL AND collar.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT CONCAT_WS('; ', '2025: BCTW -> SIMS Data Migration', collar.device_comment, collar.malfunction_comment)) FILTER (WHERE (collar.device_comment IS NOT NULL AND collar.device_comment != '') or (collar.malfunction_comment IS NOT NULL AND collar.malfunction_comment != '')), '')) AS comment,
        (array_remove(array_agg(distinct collar.frequency), null)) AS frequency,
        (array_remove(array_agg(distinct collar.frequency_unit), null)) AS frequency_unit,
        --
        attachment_start,
        (array_remove(array_agg(distinct collar_animal_assignment.attachment_end), null)) AS attachment_end,
        --
        (array_remove(array_agg(distinct collar.created_at), null)) AS collar_created_at,
        (array_remove(array_agg(distinct collar.created_by_user_id), null)) AS collar_created_by,
        (array_remove(array_agg(distinct collar.updated_at), null)) AS collar_updated_at,
        (array_remove(array_agg(distinct collar.updated_by_user_id), null)) AS collar_updated_by,
                     (array_agg(distinct collar.valid_to)) AS collar_valid_to,
        --
        (array_remove(array_agg(distinct collar_animal_assignment.created_at), null)) AS collar_animal_assignment_created_at,
        (array_remove(array_agg(distinct collar_animal_assignment.created_by_user_id), null)) AS collar_animal_assignment_created_by,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_at), null)) AS collar_animal_assignment_updated_at,
        (array_remove(array_agg(distinct collar_animal_assignment.updated_by_user_id), null)) AS collar_animal_assignment_updated_by,
                     (array_agg(distinct collar_animal_assignment.valid_to)) AS collar_animal_assignment_valid_to
    FROM
        bctw.collar_animal_assignment
    JOIN
        bctw.collar ON collar.collar_id = collar_animal_assignment.collar_id
    where
        -- select records where the deployment is invalid and the collar is valud
        not bctw.is_valid(collar_animal_assignment.valid_to) and
        bctw.is_valid(collar.valid_to)
    GROUP BY
        attachment_start, device_id, device_make
)
INSERT INTO bctw.valid_collar_invalid_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_valid_collar_deployment;


--------------------------------------------------------------------------------------------------------------
-- For the 'invalid_collar_deployment' table, set the 'internal_is_valid' to 'true' if the core columns only have 
-- 1 value in the arrays and the attachment dates don't overlap other invalid records
--------------------------------------------------------------------------------------------------------------

-- Mark all rows as valid, if they only have 1 distinct value in the important columns. This will include records that may have had multuple soft deleted rows, but because all of the key fields are unchanged, we should be able to safely merge them into 1 record.
 update 
     bctw.invalid_collar_deployment 
 set 
     internal_is_valid = true 
 where 
     valid_collar_deployment_id in (
         select
             valid_collar_deployment_id
         from
             bctw.invalid_collar_deployment
         WHERE (
             ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
         ) AND (
               ARRAY_LENGTH(device_make, 1) IS NULL
               OR ARRAY_LENGTH(device_make, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(device_model, 1) IS NULL
     --          OR ARRAY_LENGTH(device_model, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(comment, 1) IS NULL
     --          OR ARRAY_LENGTH(comment, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency_unit, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency_unit, 1) <= 1
         ) AND (
              ARRAY_LENGTH(attachment_end, 1) IS NULL
              OR ARRAY_LENGTH(attachment_end, 1) <= 1
         )
 );
 
 -- Mark rows as invalid if they have overlapping attachment dates for the same device id
 update
     bctw.invalid_collar_deployment
 set
     internal_is_valid = false
 where 
     valid_collar_deployment_id in (
         WITH w_data AS (
             select
                 *
             from
                 bctw.invalid_collar_deployment
         )
         SELECT
             t1.valid_collar_deployment_id
         FROM
             w_data as t1
         WHERE EXISTS (
             SELECT
                 1
             FROM
                 w_data AS t2
             WHERE
                 t1.valid_collar_deployment_id <> t2.valid_collar_deployment_id and
                 t1.device_id = t2.device_id and
                 t1.device_make = t2.device_make and
                 (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
         )
     );
 
--------------------------------------------------------------------------------------------------------------
-- For the 'invalid_collar_valid_deployment' table, set the 'internal_is_valid' to 'true' if the core columns only have 
-- 1 value in the arrays and the attachment dates don't overlap other invalid records
--------------------------------------------------------------------------------------------------------------

-- Mark all rows as valid, if they only have 1 distinct value in the important columns. This will include records that may have had multuple soft deleted rows, but because all of the key fields are unchanged, we should be able to safely merge them into 1 record.
 update 
     bctw.invalid_collar_valid_deployment 
 set 
     internal_is_valid = true 
 where 
     valid_collar_deployment_id in (
         select
             valid_collar_deployment_id
         from
             bctw.invalid_collar_valid_deployment
         WHERE (
             ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
         ) AND (
               ARRAY_LENGTH(device_make, 1) IS NULL
               OR ARRAY_LENGTH(device_make, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(device_model, 1) IS NULL
     --          OR ARRAY_LENGTH(device_model, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(comment, 1) IS NULL
     --          OR ARRAY_LENGTH(comment, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency_unit, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency_unit, 1) <= 1
         ) AND (
              ARRAY_LENGTH(attachment_end, 1) IS NULL
              OR ARRAY_LENGTH(attachment_end, 1) <= 1
         )
 );
 
 -- Mark rows as invalid if they have overlapping attachment dates for the same device id
 update
     bctw.invalid_collar_valid_deployment
 set
     internal_is_valid = false
 where 
     valid_collar_deployment_id in (
         WITH w_data AS (
             select
                 *
             from
                 bctw.invalid_collar_valid_deployment
         )
         SELECT
             t1.valid_collar_deployment_id
         FROM
             w_data as t1
         WHERE EXISTS (
             SELECT
                 1
             FROM
                 w_data AS t2
             WHERE
                 t1.valid_collar_deployment_id <> t2.valid_collar_deployment_id and
                 t1.device_id = t2.device_id and
                 t1.device_make = t2.device_make and
                 (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
         )
     );
 
--------------------------------------------------------------------------------------------------------------
-- For the 'valid_collar_invalid_deployment' table, set the 'internal_is_valid' to 'true' if the core columns only have 
-- 1 value in the arrays and the attachment dates don't overlap other invalid records
--------------------------------------------------------------------------------------------------------------

-- Mark all rows as valid, if they only have 1 distinct value in the important columns. This will include records that may have had multuple soft deleted rows, but because all of the key fields are unchanged, we should be able to safely merge them into 1 record.
 update 
     bctw.valid_collar_invalid_deployment 
 set 
     internal_is_valid = true 
 where 
     valid_collar_deployment_id in (
         select
             valid_collar_deployment_id
         from
             bctw.valid_collar_invalid_deployment
         WHERE (
             ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
         ) AND (
             ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
             OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
         ) AND (
               ARRAY_LENGTH(device_make, 1) IS NULL
               OR ARRAY_LENGTH(device_make, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(device_model, 1) IS NULL
     --          OR ARRAY_LENGTH(device_model, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(comment, 1) IS NULL
     --          OR ARRAY_LENGTH(comment, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency, 1) <= 1
     --    ) AND (
     --          ARRAY_LENGTH(frequency_unit, 1) IS NULL
     --          OR ARRAY_LENGTH(frequency_unit, 1) <= 1
         ) AND (
              ARRAY_LENGTH(attachment_end, 1) IS NULL
              OR ARRAY_LENGTH(attachment_end, 1) <= 1
         )
 );
 
 -- Mark rows as invalid if they have overlapping attachment dates for the same device id
 update
     bctw.valid_collar_invalid_deployment
 set
     internal_is_valid = false
 where 
     valid_collar_deployment_id in (
         WITH w_data AS (
             select
                 *
             from
                 bctw.valid_collar_invalid_deployment
         )
         SELECT
             t1.valid_collar_deployment_id
         FROM
             w_data as t1
         WHERE EXISTS (
             SELECT
                 1
             FROM
                 w_data AS t2
             WHERE
                 t1.valid_collar_deployment_id <> t2.valid_collar_deployment_id and
                 t1.device_id = t2.device_id and
                 t1.device_make = t2.device_make and
                 (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
         )
     );



-------------------------------------------------------------------------------------------------------------
-- Flatten the invalid_collar_deployment table
-------------------------------------------------------------------------------------------------------------

WITH 
-- Resolve the max values for each column (remove arrays)
w_resolved_valid_valid_collar_deployment_rows as (
    select
        valid_collar_deployment_id,
        --
        bctw_deployment_uuid[1],
        --
        bctw_collar_uuid[1],
        --
        bctw_critter_uuid[1],
        --
        device_id,
        device_make[1],
        device_model[1],
        comment[1],
        frequency[1],
        frequency_unit[1],
        attachment_start,
        attachment_end[1],
        --
        max_vals.collar_created_at,
        max_vals.collar_created_by,
        max_vals.collar_updated_at,
        max_vals.collar_updated_by,
        collar_valid_to[1],
        --
        max_vals.collar_animal_assignment_created_at,
        max_vals.collar_animal_assignment_created_by,
        max_vals.collar_animal_assignment_updated_at,
        max_vals.collar_animal_assignment_updated_by,
        collar_animal_assignment_valid_to[1]
    FROM
        bctw.invalid_collar_deployment
    CROSS JOIN LATERAL (
        SELECT
            MAX(collar_created_at) as collar_created_at,
            MAX(collar_created_by) as collar_created_by,
            MAX(collar_updated_at) as collar_updated_at,
            MAX(collar_updated_by) as collar_updated_by,
            MAX(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
            MAX(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
            MAX(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
            MAX(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
        FROM 
            (
                SELECT
                    UNNEST(collar_created_at) AS collar_created_at,
                    UNNEST(collar_created_by) AS collar_created_by,
                    UNNEST(collar_updated_at) AS collar_updated_at,
                    UNNEST(collar_updated_by) AS collar_updated_by,
                    UNNEST(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
                    UNNEST(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
                    UNNEST(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
                    UNNEST(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
                FROM 
                    bctw.invalid_collar_deployment ncd_inner
                WHERE 
                    ncd_inner.valid_collar_deployment_id = bctw.invalid_collar_deployment.valid_collar_deployment_id
            ) AS unnested
    ) AS max_vals
    WHERE
        internal_is_valid = true
)
INSERT INTO bctw.flattened_invalid_collar_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_resolved_valid_valid_collar_deployment_rows;



-------------------------------------------------------------------------------------------------------------
-- Flatten the invalid_collar_valid_deployment table
-------------------------------------------------------------------------------------------------------------

WITH 
-- Resolve the max values for each column (remove arrays)
w_resolved_valid_valid_collar_deployment_rows as (
    select
        valid_collar_deployment_id,
        --
        bctw_deployment_uuid[1],
        --
        bctw_collar_uuid[1],
        --
        bctw_critter_uuid[1],
        --
        device_id,
        device_make[1],
        device_model[1],
        comment[1],
        frequency[1],
        frequency_unit[1],
        attachment_start,
        attachment_end[1],
        --
        max_vals.collar_created_at,
        max_vals.collar_created_by,
        max_vals.collar_updated_at,
        max_vals.collar_updated_by,
        collar_valid_to[1],
        --
        max_vals.collar_animal_assignment_created_at,
        max_vals.collar_animal_assignment_created_by,
        max_vals.collar_animal_assignment_updated_at,
        max_vals.collar_animal_assignment_updated_by,
        collar_animal_assignment_valid_to[1]
    FROM
        bctw.invalid_collar_valid_deployment
    CROSS JOIN LATERAL (
        SELECT
            MAX(collar_created_at) as collar_created_at,
            MAX(collar_created_by) as collar_created_by,
            MAX(collar_updated_at) as collar_updated_at,
            MAX(collar_updated_by) as collar_updated_by,
            MAX(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
            MAX(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
            MAX(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
            MAX(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
        FROM 
            (
                SELECT
                    UNNEST(collar_created_at) AS collar_created_at,
                    UNNEST(collar_created_by) AS collar_created_by,
                    UNNEST(collar_updated_at) AS collar_updated_at,
                    UNNEST(collar_updated_by) AS collar_updated_by,
                    UNNEST(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
                    UNNEST(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
                    UNNEST(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
                    UNNEST(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
                FROM 
                    bctw.invalid_collar_valid_deployment ncd_inner
                WHERE 
                    ncd_inner.valid_collar_deployment_id = bctw.invalid_collar_valid_deployment.valid_collar_deployment_id
            ) AS unnested
    ) AS max_vals
    WHERE
        internal_is_valid = true
)
INSERT INTO bctw.flattened_invalid_collar_valid_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_resolved_valid_valid_collar_deployment_rows;



-------------------------------------------------------------------------------------------------------------
-- Flatten the valid_collar_invalid_deployment table
-------------------------------------------------------------------------------------------------------------

WITH 
-- Resolve the max values for each column (remove arrays)
w_resolved_valid_valid_collar_deployment_rows as (
    select
        valid_collar_deployment_id,
        --
        bctw_deployment_uuid[1],
        --
        bctw_collar_uuid[1],
        --
        bctw_critter_uuid[1],
        --
        device_id,
        device_make[1],
        device_model[1],
        comment[1],
        frequency[1],
        frequency_unit[1],
        attachment_start,
        attachment_end[1],
        --
        max_vals.collar_created_at,
        max_vals.collar_created_by,
        max_vals.collar_updated_at,
        max_vals.collar_updated_by,
        collar_valid_to[1],
        --
        max_vals.collar_animal_assignment_created_at,
        max_vals.collar_animal_assignment_created_by,
        max_vals.collar_animal_assignment_updated_at,
        max_vals.collar_animal_assignment_updated_by,
        collar_animal_assignment_valid_to[1]
    FROM
        bctw.valid_collar_invalid_deployment
    CROSS JOIN LATERAL (
        SELECT
            MAX(collar_created_at) as collar_created_at,
            MAX(collar_created_by) as collar_created_by,
            MAX(collar_updated_at) as collar_updated_at,
            MAX(collar_updated_by) as collar_updated_by,
            MAX(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
            MAX(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
            MAX(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
            MAX(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
        FROM 
            (
                SELECT
                    UNNEST(collar_created_at) AS collar_created_at,
                    UNNEST(collar_created_by) AS collar_created_by,
                    UNNEST(collar_updated_at) AS collar_updated_at,
                    UNNEST(collar_updated_by) AS collar_updated_by,
                    UNNEST(collar_animal_assignment_created_at) as collar_animal_assignment_created_at,
                    UNNEST(collar_animal_assignment_created_by) as collar_animal_assignment_created_by,
                    UNNEST(collar_animal_assignment_updated_at) as collar_animal_assignment_updated_at,
                    UNNEST(collar_animal_assignment_updated_by) as collar_animal_assignment_updated_by
                FROM 
                    bctw.valid_collar_invalid_deployment ncd_inner
                WHERE 
                    ncd_inner.valid_collar_deployment_id = bctw.valid_collar_invalid_deployment.valid_collar_deployment_id
            ) AS unnested
    ) AS max_vals
    WHERE
        internal_is_valid = true
)
INSERT INTO bctw.flattened_valid_collar_invalid_deployment (
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
)
select
    bctw_deployment_uuid,
    bctw_critter_uuid,
    bctw_collar_uuid,
    --
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    --
    attachment_start,
    attachment_end,
    --
    collar_created_at,
    collar_created_by,
    collar_updated_at,
    collar_updated_by,
    collar_valid_to,
    --
    collar_animal_assignment_created_at,
    collar_animal_assignment_created_by,
    collar_animal_assignment_updated_at,
    collar_animal_assignment_updated_by,
    collar_animal_assignment_valid_to
FROM
    w_resolved_valid_valid_collar_deployment_rows;
