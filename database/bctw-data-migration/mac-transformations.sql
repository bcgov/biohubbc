-- Purpose: SQL to transform data from the BCTW to the SIMS database.

-- Steps to create export SQL:
  -- 1. Run query in DBeaver
  -- 2. Bottom of window select "Export Data"
  -- 3. Select "SQL INSERT statements" as the format
  -- 4. In the "Format settings" tab, select "Target table name" and modify to SIMS table name
  -- 5. Select "Proceed" to export the data to local machine


-- STATUS: Confirmed working - no import issues

-- BCTW table: api_lotek_credential
-- SIMS table: telemetry_credential_lotek

-- This generates the SQL to transform the data from the BCTW
-- table `api_lotek_credential` to the SIMS table `lotek_credential`.

-- Question 1: Is the `is_valid` column all true?

-- Question 2: What is the value of `verified_date`?
  -- Todays date (the date the data was migrated)?
  -- The date the data was created in BCTW?

-- Query count: 1029
-- BCTW table count: 1029

SELECT
  ndeviceid,
  strspecialid,
  dtcreated,
  strsatellite,
  true AS is_valid,
  now() AS verified_date
FROM bctw.api_lotek_credential;


-- STATUS: Confirmed working - no import issues after fixing the `idcom` column type

-- BCTW table: api_vectronic_credential
-- SIMS table: telemetry_credential_vectronic

-- This generates the SQL to transform the data from the BCTW
-- table `api_vectronic_credential` to the SIMS table `telemetry_vectronic_credential`.

-- This is straight forward, no questions to answer.

-- Query count: 1123
-- BCTW table count: 1123

-- Note: The `idcom` is the incorrect type in the Biohub table.
-- Example values: 0-2399684 and 300434068136700

ALTER table biohub.telemetry_credential_vectronic
ALTER column idcom
SET DATA TYPE VARCHAR(50);

SELECT
	idcollar,
  comtype,
	idcom,
	collarkey,
	collartype
FROM bctw.api_vectronic_credential;


-- STATUS: Not confirmed - waiting for the dployments to be transferred from the
-- `deployment_old` -> `deployment` table in SIMS. Note this should work once the deployments
-- are transferred.

-- BCTW table: bctw_telemetry_manual.telemetry_manual
-- SIMS table: sims_telemetry_manual.telemetry_manual

-- This generates the SQL to transform the data from the BCTW
-- table `bctw_telemetry_manual.telemetry_manual` to the
-- SIMS table `sims_deployment_old.telemetry_manual`.

-- Note: Interestingly this query only has records for a single SIMS deployment 2601

-- Query count: 127 rows
-- BCTW table count (only valid rows): 127 rows
-- BCTW table count (all rows): 1648 rows


SELECT
	sims_deployment_old.deployment_id,
	bctw_telemetry_manual.latitude,
	bctw_telemetry_manual.longitude,
	bctw_telemetry_manual.acquisition_date
FROM bctw.telemetry_manual bctw_telemetry_manual
INNER JOIN biohub.deployment_old sims_deployment_old
ON bctw_telemetry_manual.deployment_id = sims_deployment_old.bctw_deployment_id
WHERE bctw.is_valid(valid_to);

-- STATUS: Confirmed working - no import issues

-- BCTW table: bctw.telemetry_api_ats
-- SIMS table: sims.telemetry_ats

-- This generates the SQL to transform the data from the BCTW
-- table `bctw.telemetry_api_ats` to the SIMS table `sims.telemetry_ats`.

-- Query count: 817
-- BCTW table count: 817

SELECT
	collarserialnumber,
	"date",
	numberfixes,
	battvoltage,
	mortality,
	breakoff,
	gpsontime,
	satontime,
	saterrors,
	gmtoffset,
	lowbatt,
	"event",
	latitude,
	longitude,
	cepradius_km,
	temperature,
	hdop,
	numsats,
	fixtime,
	activity
FROM bctw.telemetry_api_ats;
