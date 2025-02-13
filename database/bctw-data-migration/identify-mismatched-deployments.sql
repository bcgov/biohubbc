-------------------------------------------------------------------------------------
-- Find all sims deployments that have no matching bctw deployments, but where the critter id is the same.
-- 
-- Notes
-- Despite the deployment ids not matching, the create_date aligns almost perfectly. Use this to reconcile the mismatched deployment ids.
-------------------------------------------------------------------------------------
with 
w_missing_deployment_ids as (
  select 
    distinct on
    (bctw_deployment_id)
    deployment_old.bctw_deployment_id,
    deployment_old.deployment_id,
    deployment_old.create_date,
    deployment_old.critter_id,
    critter.critterbase_critter_id,
    critter.survey_id
  from
    biohub.deployment_old
  full join biohub.critter
    on
    biohub.deployment_old.critter_id = biohub.critter.critter_id
  where
    not exists (
      select
        1
      from
        bctw.collar_animal_assignment
      where
        bctw.collar_animal_assignment.deployment_id = bctw_deployment_id
    )
)
select
  w_missing_deployment_ids.*,
  collar_animal_assignment.*,
  ABS(EXTRACT(EPOCH FROM collar_animal_assignment.created_at::timestamp) - EXTRACT(EPOCH FROM w_missing_deployment_ids.create_date::timestamp)) as diff
from 
  w_missing_deployment_ids
left join bctw.collar_animal_assignment
on
  w_missing_deployment_ids.critterbase_critter_id = bctw.collar_animal_assignment.critter_id;
-- where ABS(EXTRACT(EPOCH FROM collar_animal_assignment.created_at::timestamp) - EXTRACT(EPOCH FROM w_missing_deployment_ids.create_date::timestamp)) < 2;

-------------------------------------------------------------------------------------
-- Find all SIMS deployment ids that do not have a matching bctw deployment id
-------------------------------------------------------------------------------------
select
  distinct on (bctw_deployment_id)
  deployment_old.bctw_deployment_id,
  deployment_old.deployment_id,
  deployment_old.create_date,
  deployment_old.critter_id,
  critter.critterbase_critter_id,
  critter.survey_id
from
  biohub.deployment_old
full join biohub.critter
  on biohub.deployment_old.critter_id = biohub.critter.critter_id
where
  not exists (
    select
      1
    from
      bctw.collar_animal_assignment
    where
      bctw.collar_animal_assignment.deployment_id = bctw_deployment_id
  )