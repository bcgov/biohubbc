## Questions

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
