drop table if exists bctw.resolved_mismatched_deployment;
drop table if exists bctw.resolved_mismatched_collars;

--------------------------------------------------------------------------------------------------------------
-- Create a new table: resolved_mismatched_deployment
--
-- Contains all of the mismatched deployment records from sims, matched with a corresponding bctw deployment record.
-- The match is based on the same critterbase_critter_id and the create_dates of both records being within 2 seconds 
-- of each other.
--
-- This returns 271 records.
--------------------------------------------------------------------------------------------------------------

select 
    mismatched_sims_deployments.survey_id,
    mismatched_sims_deployments.deployment_id,
    mismatched_sims_deployments.critter_id,
    mismatched_sims_deployments.critterbase_critter_id,
    mismatched_sims_deployments.bctw_deployment_id,
    mismatched_sims_deployments.create_date,
    mismatched_sims_deployments.create_user,
    mismatched_sims_deployments.update_date,
    mismatched_sims_deployments.update_user,
    mismatched_sims_deployments.revision_count,
    mismatched_sims_deployments.critterbase_start_capture_id,
    mismatched_sims_deployments.critterbase_end_capture_id,
    mismatched_sims_deployments.critterbase_end_mortality_id,
    --
    mismatched_deployment.mismatched_deployment_id,
    mismatched_deployment.valid_collar_deployment_id,
    mismatched_deployment.sims_survey_id,
    mismatched_deployment.bctw_deployment_uuid,
    mismatched_deployment.bctw_critter_uuid,
    mismatched_deployment.attachment_start,
    mismatched_deployment.attachment_end,
    mismatched_deployment.frequency,
    mismatched_deployment.frequency_unit
    -- mismatched_deployment.critterbase_start_capture_id,
    -- mismatched_deployment.critterbase_end_capture_id,
    -- mismatched_deployment.critterbase_end_mortality_id,
    -- mismatched_deployment.create_date,
    -- mismatched_deployment.create_user,
    -- mismatched_deployment.update_date,
    -- mismatched_deployment.update_user
into 
    bctw.resolved_mismatched_deployment
from 
    bctw.mismatched_sims_deployments
left join 
    bctw.mismatched_deployment
on
    mismatched_sims_deployments.critterbase_critter_id = mismatched_deployment.bctw_critter_uuid and 
    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM mismatched_deployment.create_date::timestamp)) < 2;

--------------------------------------------------------------------------------------------------------------
-- Create a new table: resolved_mismatched_collars
--
-- Contains all of the mismatched deployment records from sims, matched with a corresponding bctw deployment record.
-- The match is based on the same critterbase_critter_id and the create_dates of both records being within 2 seconds 
-- of each other.
--------------------------------------------------------------------------------------------------------------

select
    resolved_mismatched_deployment.survey_id,
    resolved_mismatched_deployment.deployment_id,
    resolved_mismatched_deployment.critter_id,
    resolved_mismatched_deployment.critterbase_critter_id,
    resolved_mismatched_deployment.bctw_deployment_id,
    resolved_mismatched_deployment.create_date,
    resolved_mismatched_deployment.create_user,
    resolved_mismatched_deployment.update_date,
    resolved_mismatched_deployment.update_user,
    resolved_mismatched_deployment.revision_count,
    resolved_mismatched_deployment.critterbase_start_capture_id,
    resolved_mismatched_deployment.critterbase_end_capture_id,
    resolved_mismatched_deployment.critterbase_end_mortality_id,
    --
    resolved_mismatched_deployment.mismatched_deployment_id,
    resolved_mismatched_deployment.valid_collar_deployment_id,
    resolved_mismatched_deployment.sims_survey_id,
    resolved_mismatched_deployment.bctw_deployment_uuid,
    resolved_mismatched_deployment.bctw_critter_uuid,
    resolved_mismatched_deployment.attachment_start,
    resolved_mismatched_deployment.attachment_end,
    resolved_mismatched_deployment.frequency,
    resolved_mismatched_deployment.frequency_unit,
    --
    mismatched_collar.mismatched_collar_id,
    -- mismatched_collar.valid_collar_deployment_id,
    -- mismatched_collar.sims_survey_id,
    mismatched_collar.bctw_collar_uuid,
    mismatched_collar.device_id as serial,
    mismatched_collar.device_make,
    mismatched_collar.device_model,
    mismatched_collar.comment
    -- mismatched_collar.create_date,
    -- mismatched_collar.create_user,
    -- mismatched_collar.update_date,
    -- mismatched_collar.update_user
into 
    bctw.resolved_mismatched_collars
from
    bctw.resolved_mismatched_deployment
left join 
    bctw.mismatched_collar 
on
    mismatched_collar.valid_collar_deployment_id = resolved_mismatched_deployment.valid_collar_deployment_id;


--------------------------------------------------------------------------------------------------------------
-- NICK TODO: There are 29 records in resolved_mismatched_collars that have no collar information.
update 
    bctw.resolved_mismatched_collars
set
    bctw_collar_uuid = bctw.collar.collar_id,
    serial = bctw.collar.device_id,
    device_make = bctw.collar.device_make,
    device_model = bctw.collar.device_model
from
    bctw.invalid_collar_deployment
where
    bctw.invalid_collar_deployment.critter_id = bctw.resolved_mismatched_collars.bctw_critter_uuid 
    and bctw.is_valid(bctw.collar_animal_assignment.valid_to)
    and bctw.resolved_mismatched_collars.mismatched_collar_id is null;
-- This will match on 26 of the 29 records.
select 
    *
from
    bctw.resolved_mismatched_collars     
left join
    bctw.invalid_collar_deployment
on 
    bctw.resolved_mismatched_collars.critterbase_critter_id = ANY(bctw.invalid_collar_deployment.bctw_critter_uuid)
where 
    bctw.resolved_mismatched_collars.serial is null
and (
  ABS(EXTRACT(EPOCH FROM resolved_mismatched_collars.create_date::timestamp) - EXTRACT(EPOCH FROM invalid_collar_deployment.collar_animal_assignment_created_at[1]::timestamp)) < 1
  or ABS(EXTRACT(EPOCH FROM resolved_mismatched_collars.create_date::timestamp) - EXTRACT(EPOCH FROM invalid_collar_deployment.collar_animal_assignment_created_at[2]::timestamp)) < 1
);
--------------------------------------------------------------------------------------------------------------

with 
w_clean_bctw_device_deployment as (
    select
        resolved_mismatched_deployment.survey_id,
        resolved_mismatched_deployment.deployment_id,
        resolved_mismatched_deployment.critter_id,
        resolved_mismatched_deployment.critterbase_critter_id,
        resolved_mismatched_deployment.bctw_deployment_id,
        resolved_mismatched_deployment.create_date,
        resolved_mismatched_deployment.create_user,
        resolved_mismatched_deployment.update_date,
        resolved_mismatched_deployment.update_user,
        resolved_mismatched_deployment.revision_count,
        resolved_mismatched_deployment.critterbase_start_capture_id,
        resolved_mismatched_deployment.critterbase_end_capture_id,
        resolved_mismatched_deployment.critterbase_end_mortality_id,
        --
        resolved_mismatched_deployment.mismatched_deployment_id,
        resolved_mismatched_deployment.valid_collar_deployment_id,
        resolved_mismatched_deployment.sims_survey_id,
        resolved_mismatched_deployment.bctw_deployment_uuid,
        resolved_mismatched_deployment.bctw_critter_uuid,
        resolved_mismatched_deployment.attachment_start,
        resolved_mismatched_deployment.attachment_end,
        resolved_mismatched_deployment.frequency,
        resolved_mismatched_deployment.frequency_unit,
        --
        mismatched_collar.mismatched_collar_id,
        -- mismatched_collar.valid_collar_deployment_id,
        -- mismatched_collar.sims_survey_id,
        mismatched_collar.bctw_collar_uuid,
        mismatched_collar.device_id as serial,
        mismatched_collar.device_make,
        mismatched_collar.device_model,
        mismatched_collar.comment
        -- mismatched_collar.create_date,
        -- mismatched_collar.create_user,
        -- mismatched_collar.update_date,
        -- mismatched_collar.update_user
    from
        bctw.resolved_mismatched_deployment
    left join 
        bctw.mismatched_collar 
    on
        mismatched_collar.valid_collar_deployment_id = resolved_mismatched_deployment.valid_collar_deployment_id
),
w_remove_duplicates as (
    select
        survey_id,
        --
        serial,
        device_make,
        device_model,
        comment
    from
        w_clean_bctw_device_deployment
    group by
        survey_id,
        --
        serial,
        device_make,
        device_model,
        comment
)
insert into 
    sims_bctw.mismatched_device
select
    w_remove_duplicates.survey_id,
    w_remove_duplicates.serial,
    w_remove_duplicates.device_model as model,
    (
        select
            biohub.device_make.device_make_id
        from
            biohub.device_make
        where
            biohub.device_make.name ilike (
                select
                    code_name
                from
                     bctw.code
                where
                    code_id = w_remove_duplicates.device_make::integer
            )
    ) as device_make_id,
    w_remove_duplicates.comment as comment
from
    w_remove_duplicates;

--------------------------------------------------------------------------------------------------------------
-- Insert mismatched deployments into the sims_bctw.mismatched_deployment table

with 
w_clean_bctw_device_deployment as (
    select
        resolved_mismatched_deployment.survey_id,
        resolved_mismatched_deployment.deployment_id,
        resolved_mismatched_deployment.critter_id,
        resolved_mismatched_deployment.critterbase_critter_id,
        resolved_mismatched_deployment.bctw_deployment_id,
        resolved_mismatched_deployment.create_date,
        resolved_mismatched_deployment.create_user,
        resolved_mismatched_deployment.update_date,
        resolved_mismatched_deployment.update_user,
        resolved_mismatched_deployment.revision_count,
        resolved_mismatched_deployment.critterbase_start_capture_id,
        resolved_mismatched_deployment.critterbase_end_capture_id,
        resolved_mismatched_deployment.critterbase_end_mortality_id,
        resolved_mismatched_deployment.mismatched_deployment_id,
        resolved_mismatched_deployment.valid_collar_deployment_id,
        resolved_mismatched_deployment.sims_survey_id,
        resolved_mismatched_deployment.bctw_deployment_uuid,
        resolved_mismatched_deployment.bctw_critter_uuid,
        resolved_mismatched_deployment.attachment_start,
        resolved_mismatched_deployment.attachment_end,
        resolved_mismatched_deployment.frequency,
        resolved_mismatched_deployment.frequency_unit,
        --
        mismatched_collar.mismatched_collar_id,
        -- mismatched_collar.valid_collar_deployment_id,
        -- mismatched_collar.sims_survey_id,
        mismatched_collar.bctw_collar_uuid,
        mismatched_collar.device_id as serial,
        mismatched_collar.device_make,
        mismatched_collar.device_model,
        mismatched_collar.comment
        -- mismatched_collar.create_date,
        -- mismatched_collar.create_user,
        -- mismatched_collar.update_date,
        -- mismatched_collar.update_user
    from
        bctw.resolved_mismatched_deployment
    left join 
        bctw.mismatched_collar
    on
        mismatched_collar.valid_collar_deployment_id = resolved_mismatched_deployment.valid_collar_deployment_id
)
insert into 
    sims_bctw.mismatched_deployment
select
    w_clean_bctw_device_deployment.sims_survey_id as survey_id,
    (
        select
            critter_id
        from
            biohub.critter
        where
            critter.critterbase_critter_id = w_clean_bctw_device_deployment.bctw_critter_uuid and 
            critter.survey_id = w_clean_bctw_device_deployment.sims_survey_id
    ) as critter_id,
    (
        select
            mismatched_device_id
        from
            sims_bctw.mismatched_device
        where
            mismatched_device.survey_id = w_clean_bctw_device_deployment.sims_survey_id and 
            mismatched_device.serial = w_clean_bctw_device_deployment.serial and 
            mismatched_device.device_make_id = (
                select
                    biohub.device_make.device_make_id
                from
                    biohub.device_make
                where
                    biohub.device_make.name ilike (
                        select
                            code_name
                        from
                            bctw.code
                        where
                            code_id = w_clean_bctw_device_deployment.device_make::integer
                    )
            )
    ) as mismatched_device_id,
    -- (
    --     select
    --         serial
    --     from
    --         sims_bctw.mismatched_device
    --     where
    --         mismatched_device.survey_id = w_clean_bctw_device_deployment.sims_survey_id and 
    --         mismatched_device.serial = w_clean_bctw_device_deployment.serial and 
    --         mismatched_device.device_make_id = (
    --             select
    --                 biohub.device_make.device_make_id
    --             from
    --                 biohub.device_make
    --             where
    --                 biohub.device_make.name ilike (
    --                     select
    --                         code_name
    --                     from
    --                         bctw.code
    --                     where
    --                         code_id = w_clean_bctw_device_deployment.device_make::integer
    --                 )
    --         )
    -- ) as serial,
    w_clean_bctw_device_deployment.frequency as frequency,
    (
        select
            frequency_unit.frequency_unit_id
        from
            biohub.frequency_unit
        where
            frequency_unit."name" ilike (
                select
                    code.code_name
                from
                    bctw.code
                where
                    code.code_id = w_clean_bctw_device_deployment.frequency_unit::integer
            )
    ) as frequency_unit,
    w_clean_bctw_device_deployment.attachment_start::date as attachment_start_date,
    w_clean_bctw_device_deployment.attachment_start::time as attachment_start_time,
    w_clean_bctw_device_deployment.attachment_end::date as attachment_end_date,
    w_clean_bctw_device_deployment.attachment_end::time as attachment_end_time,
    w_clean_bctw_device_deployment.critterbase_start_capture_id as critterbase_start_capture_id,
    w_clean_bctw_device_deployment.critterbase_end_capture_id as critterbase_end_capture_id,
    w_clean_bctw_device_deployment.critterbase_end_mortality_id as critterbase_end_mortality_id
from
    w_clean_bctw_device_deployment;
