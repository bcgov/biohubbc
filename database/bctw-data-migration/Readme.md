# Questions

### What do we want to do with the bctw collar records which are valid, but which have no collar_animal_assignment records (deployments)?

These collars may have telemetry data, but without a deployment record, we have no way of associating them to an animal or survey.

185 Records. Only ~8 have other information outside of the device id.

```postgresql
-- Select all collar records that aren't in the new_collar table and which have no collar_animal_assignment record
-- and which are valid
select
    *
from collar
where
    collar.collar_id not in (select bctw_collar_uuid from new_collar) and
    collar.collar_id not in (select collar_id from collar_animal_assignment) and
    collar.valid_to is null;
```

# TODO

## Records in SIMS

    - a table with all existing SIMS deployments joined to BCTW deployments + collars

        Part 1
        - Some of these already match BCTW deployment ids
            - Get matching collar_animal_assignment data
                - Get valid record if one exists, else get most recent invalid record
            - Get matching collar data
                - Get valid record if one exists, else get most recent invalid record
            - Insert into SIMS (device, deployment)

        sims_bctw: 1_collar_deployment, 1_device, 1_deployment

        Part 2
        - Some do not match existing deployment ids
            - Reconcile mismatched deployment ids using critter uuid + create_date
            - Get matching collar_animal_assignment data
                - Get valid record if one exists, else get most recent invalid record
            - Get matching collar data
                - Get valid record if one exists, else get most recent invalid record
            - Insert into SIMS

            sims_bctw: 2_collar_deployment, 2_device, 2_deployment

    sims.deployment_old -> bctw.existing_collar_deployment -> sims.device, sims.deployment

## Records in BCTW

    Part 3
    - A table with all existing BCTW deployments + collars
        - strip out invalid collars/deployments
        - strip out records that are already in SIMS (Filter out deployment ids that are in sims.deployment_old AND have a matching deployment id in bctw.collar_animal_assignment. These will be accounted for in Parts 1 and 2)
        - Insert remaining into SIMS

    (bctw.new_collar_deployment - bctw.existing_collar_deployment) -> sims.device, sims.deployment

    sims_bctw: 3_collar_deployment, 3_device, 3_deployment

##

    1_collar_deployment (90% of deployment_old)
    2_collar_deployment (10% of deployment_old)
    3_collar_deployment (new new not in deployment_old)
