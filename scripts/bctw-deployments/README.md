# Generate SQL from existing BCTW Caribou deployments

## Purpose
SIMS needs to be updated to include existing BCTW deployments. This script combines BCTW deployments with
matching critters and injects Caribou region herd geometries.

## Pre requisites
1. BCTW SQL - Export valid telemetry collar deployments as JSON.
```sql
SELECT
  deployment_id,
  critter_id,
  attachment_start
FROM collar_animal_assignment
WHERE bctw.is_valid(valid_to)
AND attachment_start IS NOT NULL;
```
2. Critterbase SQL - Export all caribou as JSON.
```sql
SELECT
	c.critter_id,
	u.unit_name
FROM
	critter c
JOIN critter_collection_unit cc
ON
	c.critter_id = cc.critter_id
JOIN xref_collection_unit u
ON
	cc.collection_unit_id = u.collection_unit_id
WHERE
	c.itis_tsn = 180701;
```
3. Create JSON file from previous outputs as single array.

- critter_deployments.json
```json
[
  {
    "critter_id": "A",
    "unit_name": "Atlin"
  },
  {
    "critter_id": "B",
    "unit_name": "Atlin"
  },
  {
    "deployment_id": "C",
    "critter_id": "A",
    "attachment_start": "2024-01-01",
  },
  {
    "deployment_id": "D",
    "critter_id": "B",
    "attachment_start": "2024-01-01",
  },
  ...
]

```

## How to run
1. Create input file.
2. Call run.sh with input file as argument.

```bash
./run.sh {input-filename}.json

# Dev example
./run.sh input.dev.json
```

## Requirements
- Ticket: [SIMSBIOHUB-496](https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-496)

As a biologist who had uploaded telemetry deployments to BCTW through the BCTW UI, I want to see those deployment IDs in a SIMS Survey.

When deciding what Survey to put a deployment ID in, group by deployment year and caribou herd.

For example,

- Telkwa herd 2021 would be a Survey
- Telkwa herd 2022 would be a Survey
- Porcupine herd 2022 would be a Survey

#### For every Survey, make a new Project with the following values:

- Name: Caribou herd name - telemetry
- Program: Wildlife
- Dates: Jan. 1 - Dec. 31 of {year}
- Objectives: Telemetry deployments for Caribou herd name in year.

#### For each Survey, include these values:

- Name: Caribou herd name - Year - telemetry
- Type: Monitoring
- Start date: Date of the earliest telemetry deployment in the Survey
- End date: Date of the last telemetry deployment in the Survey
- Species: Caribou
- Ecological Variables: Mortality, Distribution
- Site selection strategy: "Oportunistic" (have to add this as an option)
- Study area: Relevant herd's boundary


