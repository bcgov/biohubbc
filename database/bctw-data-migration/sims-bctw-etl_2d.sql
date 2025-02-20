drop table if exists sims_bctw.final_mismatched_device_deployment;

--------------------------------------------------------------------------------------------------------------
-- Create a new table: final_mismatched_device_deployment
--
-- Record count: 271 / 266 (5 remaining)
--------------------------------------------------------------------------------------------------------------

-- Insert happy path records (242 records)
select 
  * 
into 
    sims_bctw.final_mismatched_device_deployment
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
    sims_bctw.final_mismatched_device_deployment
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
      select deployment_id from sims_bctw.final_mismatched_device_deployment
    );

-- Insert where the deployment is invalid, but the collar is valid (19 records)
insert into 
    sims_bctw.final_mismatched_device_deployment
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
      select deployment_id from sims_bctw.final_mismatched_device_deployment
    );

-- Insert where the deployment is invalid, and the collar is invalid (0 records)
--insert into 
--    sims_bctw.final_mismatched_device_deployment
--select
--  *
--from
--    bctw.mismatched_sims_deployments
--inner join
--    bctw.flattened_invalid_collar_deployment
--on
--    bctw.flattened_invalid_collar_deployment.bctw_critter_uuid = bctw.mismatched_sims_deployments.critterbase_critter_id
--and
--    ABS(EXTRACT(EPOCH FROM mismatched_sims_deployments.create_date::timestamp) - EXTRACT(EPOCH FROM flattened_invalid_collar_deployment.collar_animal_assignment_created_at::timestamp)) < 2
--and
--    bctw.mismatched_sims_deployments.deployment_id not in (
--      select deployment_id from sims_bctw.final_mismatched_device_deployment
--    );
