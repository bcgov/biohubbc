drop table if exists bctw.final_mismatched_device_deployment;

--------------------------------------------------------------------------------------------------------------
-- Create a new table: final_mismatched_device_deployment
--------------------------------------------------------------------------------------------------------------

-- Insert happy path records (242 records)
select 
  * 
into 
    bctw.final_mismatched_device_deployment
from 
    bctw.mismatched_sims_deployments
inner join 
    bctw.flattened_valid_collar_deployment
on
    mismatched_sims_deployments.critterbase_critter_id = flattened_valid_collar_deployment.bctw_critter_uuid 
and 
    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM flattened_valid_collar_deployment.collar_animal_assignment_created_at::timestamp)) < 2;

-- Insert where the deployment is valid, but the collar is invalid (5 records)
insert into 
    bctw.final_mismatched_device_deployment
select
  *
from
    bctw.mismatched_sims_deployments
inner join
    bctw.flattened_invalid_collar_valid_deployment
on
    bctw.flattened_invalid_collar_valid_deployment.bctw_critter_uuid = bctw.mismatched_sims_deployments.critterbase_critter_id
and
    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM flattened_invalid_collar_valid_deployment.collar_animal_assignment_created_at::timestamp)) < 2
and 
    bctw.mismatched_sims_deployments.deployment_id not in (
      select deployment_id from bctw.final_mismatched_device_deployment
    );

-- Insert where the deployment is invalid, but the collar is valid (19 records)
insert into 
    bctw.final_mismatched_device_deployment
select
  *
from
    bctw.mismatched_sims_deployments
inner join
    bctw.flattened_valid_collar_invalid_deployment
on
    bctw.flattened_valid_collar_invalid_deployment.bctw_critter_uuid = bctw.mismatched_sims_deployments.critterbase_critter_id
and
    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM flattened_valid_collar_invalid_deployment.collar_animal_assignment_created_at::timestamp)) < 2
and
    bctw.mismatched_sims_deployments.deployment_id not in (
      select deployment_id from bctw.final_mismatched_device_deployment
    );

-- Insert where the deployment is invalid, and the collar is invalid (0 records)
insert into 
    bctw.final_mismatched_device_deployment
select
  *
from
    bctw.mismatched_sims_deployments
inner join
    bctw.flattened_invalid_collar_deployment
on
    bctw.flattened_invalid_collar_deployment.bctw_critter_uuid = bctw.mismatched_sims_deployments.critterbase_critter_id
and
    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM flattened_invalid_collar_deployment.collar_animal_assignment_created_at::timestamp)) < 2
and
    bctw.mismatched_sims_deployments.deployment_id not in (
      select deployment_id from bctw.final_mismatched_device_deployment
    );
--
----------------------------------------------------------------------------------------------------------------------
--
--with 
--w_clean_bctw_device_deployment as (
--    select
--        resolved_mismatched_deployment.survey_id,
--        resolved_mismatched_deployment.deployment_id,
--        resolved_mismatched_deployment.critter_id,
--        resolved_mismatched_deployment.critterbase_critter_id,
--        resolved_mismatched_deployment.bctw_deployment_id,
--        resolved_mismatched_deployment.create_date,
--        resolved_mismatched_deployment.create_user,
--        resolved_mismatched_deployment.update_date,
--        resolved_mismatched_deployment.update_user,
--        resolved_mismatched_deployment.revision_count,
--        resolved_mismatched_deployment.critterbase_start_capture_id,
--        resolved_mismatched_deployment.critterbase_end_capture_id,
--        resolved_mismatched_deployment.critterbase_end_mortality_id,
--        --
--        resolved_mismatched_deployment.mismatched_deployment_id,
--        resolved_mismatched_deployment.valid_collar_deployment_id,
--        resolved_mismatched_deployment.sims_survey_id,
--        resolved_mismatched_deployment.bctw_deployment_uuid,
--        resolved_mismatched_deployment.bctw_critter_uuid,
--        resolved_mismatched_deployment.attachment_start,
--        resolved_mismatched_deployment.attachment_end,
--        resolved_mismatched_deployment.frequency,
--        resolved_mismatched_deployment.frequency_unit,
--        --
--        mismatched_collar.mismatched_collar_id,
--        -- mismatched_collar.valid_collar_deployment_id,
--        -- mismatched_collar.sims_survey_id,
--        mismatched_collar.bctw_collar_uuid,
--        mismatched_collar.device_id as serial,
--        mismatched_collar.device_make,
--        mismatched_collar.device_model,
--        mismatched_collar.comment
--        -- mismatched_collar.create_date,
--        -- mismatched_collar.create_user,
--        -- mismatched_collar.update_date,
--        -- mismatched_collar.update_user
--    from
--        bctw.resolved_mismatched_deployment
--    left join 
--        bctw.mismatched_collar 
--    on
--        mismatched_collar.valid_collar_deployment_id = resolved_mismatched_deployment.valid_collar_deployment_id
--),
--w_remove_duplicates as (
--    select
--        survey_id,
--        --
--        serial,
--        device_make,
--        device_model,
--        comment
--    from
--        w_clean_bctw_device_deployment
--    group by
--        survey_id,
--        --
--        serial,
--        device_make,
--        device_model,
--        comment
--)
--insert into 
--    sims_bctw.mismatched_device
--select
--    w_remove_duplicates.survey_id,
--    w_remove_duplicates.serial,
--    w_remove_duplicates.device_model as model,
--    (
--        select
--            biohub.device_make.device_make_id
--        from
--            biohub.device_make
--        where
--            biohub.device_make.name ilike (
--                select
--                    code_name
--                from
--                     bctw.code
--                where
--                    code_id = w_remove_duplicates.device_make::integer
--            )
--    ) as device_make_id,
--    w_remove_duplicates.comment as comment
--from
--    w_remove_duplicates;
--
----------------------------------------------------------------------------------------------------------------
---- Insert mismatched deployments into the sims_bctw.mismatched_deployment table
--
--with 
--w_clean_bctw_device_deployment as (
--    select
--        resolved_mismatched_deployment.survey_id,
--        resolved_mismatched_deployment.deployment_id,
--        resolved_mismatched_deployment.critter_id,
--        resolved_mismatched_deployment.critterbase_critter_id,
--        resolved_mismatched_deployment.bctw_deployment_id,
--        resolved_mismatched_deployment.create_date,
--        resolved_mismatched_deployment.create_user,
--        resolved_mismatched_deployment.update_date,
--        resolved_mismatched_deployment.update_user,
--        resolved_mismatched_deployment.revision_count,
--        resolved_mismatched_deployment.critterbase_start_capture_id,
--        resolved_mismatched_deployment.critterbase_end_capture_id,
--        resolved_mismatched_deployment.critterbase_end_mortality_id,
--        resolved_mismatched_deployment.mismatched_deployment_id,
--        resolved_mismatched_deployment.valid_collar_deployment_id,
--        resolved_mismatched_deployment.sims_survey_id,
--        resolved_mismatched_deployment.bctw_deployment_uuid,
--        resolved_mismatched_deployment.bctw_critter_uuid,
--        resolved_mismatched_deployment.attachment_start,
--        resolved_mismatched_deployment.attachment_end,
--        resolved_mismatched_deployment.frequency,
--        resolved_mismatched_deployment.frequency_unit,
--        --
--        mismatched_collar.mismatched_collar_id,
--        -- mismatched_collar.valid_collar_deployment_id,
--        -- mismatched_collar.sims_survey_id,
--        mismatched_collar.bctw_collar_uuid,
--        mismatched_collar.device_id as serial,
--        mismatched_collar.device_make,
--        mismatched_collar.device_model,
--        mismatched_collar.comment
--        -- mismatched_collar.create_date,
--        -- mismatched_collar.create_user,
--        -- mismatched_collar.update_date,
--        -- mismatched_collar.update_user
--    from
--        bctw.resolved_mismatched_deployment
--    left join 
--        bctw.mismatched_collar
--    on
--        mismatched_collar.valid_collar_deployment_id = resolved_mismatched_deployment.valid_collar_deployment_id
--)
--insert into 
--    sims_bctw.mismatched_deployment
--select
--    w_clean_bctw_device_deployment.sims_survey_id as survey_id,
--    (
--        select
--            critter_id
--        from
--            biohub.critter
--        where
--            critter.critterbase_critter_id = w_clean_bctw_device_deployment.bctw_critter_uuid and 
--            critter.survey_id = w_clean_bctw_device_deployment.sims_survey_id
--    ) as critter_id,
--    (
--        select
--            mismatched_device_id
--        from
--            sims_bctw.mismatched_device
--        where
--            mismatched_device.survey_id = w_clean_bctw_device_deployment.sims_survey_id and 
--            mismatched_device.serial = w_clean_bctw_device_deployment.serial and 
--            mismatched_device.device_make_id = (
--                select
--                    biohub.device_make.device_make_id
--                from
--                    biohub.device_make
--                where
--                    biohub.device_make.name ilike (
--                        select
--                            code_name
--                        from
--                            bctw.code
--                        where
--                            code_id = w_clean_bctw_device_deployment.device_make::integer
--                    )
--            )
--    ) as mismatched_device_id,
--    -- (
--    --     select
--    --         serial
--    --     from
--    --         sims_bctw.mismatched_device
--    --     where
--    --         mismatched_device.survey_id = w_clean_bctw_device_deployment.sims_survey_id and 
--    --         mismatched_device.serial = w_clean_bctw_device_deployment.serial and 
--    --         mismatched_device.device_make_id = (
--    --             select
--    --                 biohub.device_make.device_make_id
--    --             from
--    --                 biohub.device_make
--    --             where
--    --                 biohub.device_make.name ilike (
--    --                     select
--    --                         code_name
--    --                     from
--    --                         bctw.code
--    --                     where
--    --                         code_id = w_clean_bctw_device_deployment.device_make::integer
--    --                 )
--    --         )
--    -- ) as serial,
--    w_clean_bctw_device_deployment.frequency as frequency,
--    (
--        select
--            frequency_unit.frequency_unit_id
--        from
--            biohub.frequency_unit
--        where
--            frequency_unit."name" ilike (
--                select
--                    code.code_name
--                from
--                    bctw.code
--                where
--                    code.code_id = w_clean_bctw_device_deployment.frequency_unit::integer
--            )
--    ) as frequency_unit,
--    w_clean_bctw_device_deployment.attachment_start::date as attachment_start_date,
--    w_clean_bctw_device_deployment.attachment_start::time as attachment_start_time,
--    w_clean_bctw_device_deployment.attachment_end::date as attachment_end_date,
--    w_clean_bctw_device_deployment.attachment_end::time as attachment_end_time,
--    w_clean_bctw_device_deployment.critterbase_start_capture_id as critterbase_start_capture_id,
--    w_clean_bctw_device_deployment.critterbase_end_capture_id as critterbase_end_capture_id,
--    w_clean_bctw_device_deployment.critterbase_end_mortality_id as critterbase_end_mortality_id
--from
--    w_clean_bctw_device_deployment;
