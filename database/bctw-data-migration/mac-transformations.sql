-------------------------------------------------------------------------------------------------------

-- Purpose: SQL to transform data from the BCTW to the SIMS database.

-- Steps to create export SQL:
  -- 1. Run query in DBeaver
  -- 2. Bottom of window select "Export Data"
  -- 3. Select "SQL INSERT statements" as the format
  -- 4. In the "Format settings" tab, select "Target table name" and modify to SIMS table name
  -- 5. Select "Proceed" to export the data to local machine


-------------------------------------------------------------------------------------------------------

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


-------------------------------------------------------------------------------------------------------

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


-------------------------------------------------------------------------------------------------------

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


-------------------------------------------------------------------------------------------------------

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


-------------------------------------------------------------------------------------------------------

-- STATUS:

-- BCTW table: bctw.collar
-- SIMS table: sims.device

-- This generates the SQL to transform the data from the BCTW
-- table `bctw.collar` to the SIMS table `sims.device`.

-- Query count:
-- BCTW table count:


-- Collars without a device_make - Omitting

-- |collar_id                           | device_id|
-- |-----------------------------------------------|
-- |2bee2455-2f14-41ff-a9b9-e9d79880fd18| 29597    | lotek: [x] vectronic: [x] ats: [x]
-- |f14fd63e-6a46-41be-93f9-356311d7bf68| 29598    | lotek: [x] vectronic: [x] ats: [x]
-- |e002fb78-2748-4170-bea8-5fa654745895| 31176    | lotek: [x] vectronic: [x] ats: [x]
-- |d03ac01d-47c7-478e-af07-1c35b7376b9a| 31175    | lotek: [x] vectronic: [x] ats: [x]
-- |885956bb-6a01-41bb-9dd2-b075991b85dd| 29173    | lotek: [x] vectronic: [x] ats: [x]
-- |37c2ac8f-3f8c-46e0-8770-718695822f19| 31174    | lotek: [x] vectronic: [x] ats: [x]

SELECT
  --survey_id,
  -- This will need to be a sub-select or join to get the survey_id
  -- based on the collar_animal_assignment / deployment tables
  bctw_collar.device_id as serial,
  bctw_collar.device_model as model,
  (
  SELECT sims_device_make.device_make_id
  FROM biohub.device_make sims_device_make
  WHERE sims_device_make.name ILIKE (
      SELECT code_name
      FROM bctw.code
      WHERE code_id = bctw_collar.device_make
    )
  ) as device_make_id,
  -- Note: In PROD records only have the device_comment or the malfunction_comment but not both
  CONCAT_WS( ' + ','2025: BCTW -> SIMS Data Migration', bctw_collar.device_comment, bctw_collar.malfunction_comment) as comment
FROM bctw.collar bctw_collar
WHERE bctw.is_valid(bctw_collar.valid_to)
AND device_make IS NOT NULL;

