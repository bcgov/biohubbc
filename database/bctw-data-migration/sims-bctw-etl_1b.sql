--------------------------------------------------------------------------------------------------------------
-- Populate valid_collar_deployment table
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
INSERT INTO bctw.valid_collar_deployment (
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
