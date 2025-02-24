These scripts were written to facilitate the ETL of BCTW data into SIMS.

These scripts are designed to be run in alphanumeric order. See `run.sh`.

The final result of these scripts is the creation of a number of records in the SIMS database. Tables affected:

- `device`
- `deployment`
- `telemetry_credential_lotek`
- `telemetry_credential_vectronic`
- `telemetry_ats`
- `telemetry_manual`
- `telemetry_historic`

## Development Notes

Pre-migration: the list of all deployments in SIMS were stored in the `deployment_old` table.

### Mismatched Records

There are a number of files/tables referred to as `mismatched`.
There was a bug briefly in SIMS that causes deployment records created in SIMS to
generate a new deployment uuid, rather than using the one from BCTW. This caused the deployment uuids to not match
between SIMS and BCTW when they were meant to. To reconsile these mismatches, we are comparing the create_date of the
deployment record in SIMS to the created_at date in BCTW. If the difference is less than 2 seconds, AND the critter uuid
is the same in both records, AND it is a unique match, then we consider the records to be a match.

### Records in biohub.deployment_old with no matching BCTW deployment uuid

Records with both a valid deployment record and valid collar record (happy path)

Records with an invalid deployment record and/or invalid collar record (may require more complicated resolution)

### Records in biohub.deployment_old with a matching BCTW deployment uuid

Records with both a valid deployment record and valid collar record (happy path)

Records with an invalid deployment record and/or invalid collar record (may require more complicated resolution)
