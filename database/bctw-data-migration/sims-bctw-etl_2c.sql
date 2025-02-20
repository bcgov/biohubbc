--------------------------------------------------------------------------------------------------------------
-- Populate mismatched_collar_deployment table
--------------------------------------------------------------------------------------------------------------

with w_mismatched_collar_deployment as (
    select
        (array_remove(array_agg(distinct collar_animal_assignment.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct collar_animal_assignment.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct collar.collar_id), null)) AS bctw_collar_uuid,
        --
        collar.device_id,
        (array_remove(array_agg(distinct collar.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_model) FILTER (WHERE collar.device_model IS NOT NULL AND collar.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_comment) FILTER (WHERE collar.device_comment IS NOT NULL AND collar.device_comment != ''), '')) AS comment,
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
        -- Filter out all invalid bctw deployments and collars
        bctw.is_valid(collar_animal_assignment.valid_to) and
        bctw.is_valid(collar.valid_to)
    GROUP BY
        attachment_start, device_id, device_make
)
INSERT INTO bctw.mismatched_collar_deployment (
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
    w_mismatched_collar_deployment;

--------------------------------------------------------------------------------------------------------------
-- Populate invalid_mismatched_collar_deployment table
--------------------------------------------------------------------------------------------------------------

with w_mismatched_collar_deployment as (
    select
        (array_remove(array_agg(distinct collar_animal_assignment.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct collar_animal_assignment.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct collar.collar_id), null)) AS bctw_collar_uuid,
        --
        collar.device_id,
        (array_remove(array_agg(distinct collar.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_model) FILTER (WHERE collar.device_model IS NOT NULL AND collar.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT collar.device_comment) FILTER (WHERE collar.device_comment IS NOT NULL AND collar.device_comment != ''), '')) AS comment,
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
        -- Filter out all invalid bctw deployments and collars
        not bctw.is_valid(collar_animal_assignment.valid_to) or
        not bctw.is_valid(collar.valid_to)
    GROUP BY
        attachment_start, device_id, device_make
)
INSERT INTO bctw.invalid_mismatched_collar_deployment (
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
    w_mismatched_collar_deployment;

--------------------------------------------------------------------------------------------------------------

-- Mark all rows as valid, if they only have 1 distinct value in the important columns. This will include records that may have had multuple soft deleted rows, but because all of the key fields are unchanged, we should be able to safely merge them into 1 record.
-- update 
--     bctw.mismatched_collar_deployment 
-- set 
--     internal_is_valid = true 
-- where 
--     mismatched_collar_deployment_id in (
--         select
--             mismatched_collar_deployment_id
--         from
--             bctw.mismatched_collar_deployment
--         WHERE (
--             ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
--             OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
--         ) AND (
--             ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
--             OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
--         ) AND (
--             ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
--             OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
--     --    ) AND (
--     --          ARRAY_LENGTH(device_make, 1) IS NULL
--     --          OR ARRAY_LENGTH(device_make, 1) <= 1
--     --    ) AND (
--     --          ARRAY_LENGTH(device_model, 1) IS NULL
--     --          OR ARRAY_LENGTH(device_model, 1) <= 1
--     --    ) AND (
--     --          ARRAY_LENGTH(comment, 1) IS NULL
--     --          OR ARRAY_LENGTH(comment, 1) <= 1
--     --    ) AND (
--     --          ARRAY_LENGTH(frequency, 1) IS NULL
--     --          OR ARRAY_LENGTH(frequency, 1) <= 1
--     --    ) AND (
--     --          ARRAY_LENGTH(frequency_unit, 1) IS NULL
--     --          OR ARRAY_LENGTH(frequency_unit, 1) <= 1
--         ) AND (
--             ARRAY_LENGTH(attachment_end, 1) IS NULL
--             OR ARRAY_LENGTH(attachment_end, 1) <= 1
--         )
-- );

--------------------------------------------------------------------------------------------------------------

-- Mark rows as invalid if they have overlapping attachment dates for the same device id
-- update
--     bctw.mismatched_collar_deployment
-- set
--     internal_is_valid = false
-- where 
--     mismatched_collar_deployment_id in (
--         WITH w_data AS (
--             select
--                 *
--             from
--                 bctw.mismatched_collar_deployment
--         )
--         SELECT
--             t1.mismatched_collar_deployment_id
--         FROM
--             w_data as t1
--         WHERE EXISTS (
--             SELECT
--                 1
--             FROM
--                 w_data AS t2
--             WHERE
--                 t1.mismatched_collar_deployment_id <> t2.mismatched_collar_deployment_id and
--                 t1.device_id = t2.device_id and
--                 t1.device_make = t2.device_make and
--                 (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
--         )
--     ) 
-- RETURNING mismatched_collar_deployment_id;

--------------------------------------------------------------------------------------------------------------
-- Populate mismatched_collar and mismatched_deployment tables
--
-- Notes
-- This should only include rows where there is only 1 deployment for 1 critter for 1 make for 1 model, etc.
-- We only take the MAX for the create/update/user values, in order to squash the soft delete timestamps down.
--------------------------------------------------------------------------------------------------------------

WITH 
-- Get valid mismatched_collar_deployment rows
w_valid_mismatched_collar_deployment_rows AS (
    select
        *
    from
        bctw.mismatched_collar_deployment
    -- WHERE
    --     internal_is_valid is true
),
-- Resolve the max values for each column (remove arrays)
w_resolved_valid_mismatched_collar_deployment_rows as (
    select
        mismatched_collar_deployment_id,
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
        collar_valid_to,
        --
        max_vals.collar_animal_assignment_created_at,
        max_vals.collar_animal_assignment_created_by,
        max_vals.collar_animal_assignment_updated_at,
        max_vals.collar_animal_assignment_updated_by,
        collar_animal_assignment_valid_to
    FROM
        w_valid_mismatched_collar_deployment_rows
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
                    bctw.mismatched_collar_deployment ncd_inner
                WHERE 
                    ncd_inner.mismatched_collar_deployment_id = w_valid_mismatched_collar_deployment_rows.mismatched_collar_deployment_id
            ) AS unnested
    ) AS max_vals
),
-- Insert into mismatched_collar
w_mismatched_collar AS (
    INSERT INTO bctw.mismatched_collar (
        mismatched_collar_deployment_id,
        --
        bctw_collar_uuid,
        --
        device_id,
        device_make,
        device_model,
        comment,
        --
        create_date,
        create_user,
        update_date,
        update_user
    )
    select
        mismatched_collar_deployment_id,
        --
        bctw_collar_uuid,
        --
        device_id,
        -- If there is no device_make, default to LOTEK
        coalesce(
            device_make,
            (
                select
                    code_id::text
                from
                     bctw.code
                where
                     bctw.code.code_name ilike 'LOTEK'
            )
        ),
        device_model,
        comment,
        --
        collar_created_at,
        collar_created_by,
        collar_updated_at,
        collar_updated_by
    FROM
        w_resolved_valid_mismatched_collar_deployment_rows
    RETURNING 
        *
)
-- Insert into mismatched_deployment
INSERT INTO bctw.mismatched_deployment (
    mismatched_collar_deployment_id,
    --
    bctw_deployment_uuid,
    --
    bctw_critter_uuid,
    --
    attachment_start,
    attachment_end,
    frequency,
    frequency_unit,
    --
    create_date,
    create_user,
    update_date,
    update_user
)
select
    w_resolved_valid_mismatched_collar_deployment_rows.mismatched_collar_deployment_id,
    --
    w_resolved_valid_mismatched_collar_deployment_rows.bctw_deployment_uuid,
    --
    w_resolved_valid_mismatched_collar_deployment_rows.bctw_critter_uuid,
    --
    w_resolved_valid_mismatched_collar_deployment_rows.attachment_start,
    w_resolved_valid_mismatched_collar_deployment_rows.attachment_end,
    w_resolved_valid_mismatched_collar_deployment_rows.frequency,
    w_resolved_valid_mismatched_collar_deployment_rows.frequency_unit,
    --
    w_resolved_valid_mismatched_collar_deployment_rows.collar_animal_assignment_created_at,
    w_resolved_valid_mismatched_collar_deployment_rows.collar_animal_assignment_created_by,
    w_resolved_valid_mismatched_collar_deployment_rows.collar_animal_assignment_updated_at,
    w_resolved_valid_mismatched_collar_deployment_rows.collar_animal_assignment_updated_by
FROM
    w_mismatched_collar
JOIN
    w_resolved_valid_mismatched_collar_deployment_rows
ON
    w_resolved_valid_mismatched_collar_deployment_rows.mismatched_collar_deployment_id = w_mismatched_collar.mismatched_collar_deployment_id;
