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
),
w_unique_bctw_records as (
  select
    *
  from
    bctw.collar_animal_assignment
  where
    collar_animal_assignment.valid_to is null
    or collar_animal_assignment.deployment_id in (
      select
        collar_animal_assignment.deployment_id
      from
        bctw.collar_animal_assignment
      group by
        collar_animal_assignment.deployment_id
      having
        COUNT(*) = 1
    )
)
select
  w_missing_deployment_ids.*,
  w_unique_bctw_records.*,
  ABS(extract(EPOCH from w_unique_bctw_records.created_at::timestamp) - extract(EPOCH from w_missing_deployment_ids.create_date::timestamp)) as diff
from 
  w_missing_deployment_ids
left join w_unique_bctw_records
on
  w_missing_deployment_ids.critterbase_critter_id = w_unique_bctw_records.critter_id;
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

-------------------------------------------------------------------------------------
-- Get all unique bctw deployment records
-- Return the row if valid_to is null OR return the row if that deployment id only has one row (and the valid_to can be anything)
-------------------------------------------------------------------------------------
  
select
    collar_animal_assignment.*
from
    bctw.collar_animal_assignment
where
    collar_animal_assignment.valid_to is null
  or collar_animal_assignment.deployment_id in (
    select
        collar_animal_assignment.deployment_id
    from
        bctw.collar_animal_assignment
    group by
        collar_animal_assignment.deployment_id
    having
        count(*) = 1
  );

-------------------------------------------------------------------------------------
-- Get all bctw deployment records where there is more than 1 active record, which is bad.
-- Ideally this returns no rows.
-------------------------------------------------------------------------------------
  
with w_unique_deployment_ids_check as (
  select
    collar_animal_assignment.deployment_id,
    count(*) as count
  from
    bctw.collar_animal_assignment
  where
    collar_animal_assignment.valid_to is null
    or collar_animal_assignment.deployment_id in (
      select
        collar_animal_assignment.deployment_id
      from
        bctw.collar_animal_assignment
      group by
        collar_animal_assignment.deployment_id
      having
        count(*) = 1
    )
  group by
    collar_animal_assignment.deployment_id
),
w_deployments_with_multiple_active_rows as (
  select
    *
  from
    w_unique_deployment_ids_check
  where
    count > 1
)
select
  *
from
  bctw.collar_animal_assignment
where
  collar_animal_assignment.deployment_id in (
    select
      deployment_id
    from
      w_deployments_with_multiple_active_rows
  );