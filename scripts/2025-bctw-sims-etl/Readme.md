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

## Data

### Records in biohub.deployment_old with no matching BCTW deployment uuid

Records with both a valid deployment record and valid collar record (happy path)

Records with an invalid deployment record and/or invalid collar record (may require more complicated resolution)

### Records in biohub.deployment_old with a matching BCTW deployment uuid

Records with both a valid deployment record and valid collar record (happy path)

Records with an invalid deployment record and/or invalid collar record (may require more complicated resolution)

## TODO

### sims-bctw-etl_0X.sql

- Initial setup

### sims-bctw-etl_1X.sql

- Common bctw combined tables

### sims-bctw-etl_2X.sql

- Records in biohub.deployment_old with no matching BCTW deployment uuid
  - Match to their corresponding collar_animal_assignment + collar records using critter uuid + dates

TODO: Resolve remaining missing collar records

### sims-bctw-etl_3X.sql

- Records in biohub.deployment_old with matching BCTW deployment uuid
  - Match to their corresponding collar_animal_assignment + collar records using deployment uuid

TODO: finish

### sims-bctw-etl_4X.sql

- Final insert of device and deployment data into real sims tables

TODO: finish when 2X and 3X are done.

### sims-bctw-etl_5X.sql

- Telemetry credential data

### sims-bctw-etl_6X.sql

- Historic manual telemetry data
