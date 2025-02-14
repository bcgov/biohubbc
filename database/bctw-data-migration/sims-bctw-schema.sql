--------------------------------------------------------------------------------------------------------------
-- Create SIMS BCTW schema
--------------------------------------------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS sims_bctw;

--------------------------------------------------------------------------------------------------------------
-- Drop SIMS BCTW tables
--------------------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS sims_bctw.telemetry_credential_lotek;
DROP TABLE IF EXISTS sims_bctw.telemetry_credential_vectronic;
DROP TABLE IF EXISTS sims_bctw.telemetry_ats;
DROP TABLE IF EXISTS sims_bctw.device;

--------------------------------------------------------------------------------------------------------------
-- Create function to map a BCTW user ID SIMS user ID
--------------------------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION sims_bctw.convert_bctw_user_to_sims_user(bctw_id integer, is_update_user boolean)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$

DECLARE
  sims_user_id integer;
  postgres_user_id integer;

BEGIN

  IF bctw_id IS NULL AND is_update_user = true THEN
    RETURN null;
  END IF;

  sims_user_id := (
    SELECT
      u.id
    FROM bctw.user u
    INNER JOIN biohub.system_user su
      ON su.user_guid ILIKE u.keycloak_guid
    WHERE u.id = bctw_id
    LIMIT 1
  );

  postgres_user_id := (
    SELECT system_user_id
    FROM biohub.system_user
    WHERE user_identifier = 'postgres'
  );

  IF postgres_user_id IS NULL THEN
    RAISE EXCEPTION 'The SIMS postgres user does not exist';
  END IF;

	IF sims_user_id IS NOT NULL THEN
    RETURN sims_user_id;
  END IF;

  RETURN postgres_user_id;

END;
$function$
;

--------------------------------------------------------------------------------------------------------------
-- Create SIMS telemetry_credential_lotek table
--------------------------------------------------------------------------------------------------------------

SELECT
  ndeviceid,
  strspecialid,
  dtcreated,
  strsatellite,
  true AS is_valid, -- question: Are all records valid?
  now() AS verified_date, -- question: Is this the current date?
  --
  -- Audit Columns
  --
  -- Note: The `create_date` is when the record was created in BCTW
  -- Note: The `update_date` is hardcoded to NULL
  -- Note: The `create_user` column is hardcoded to the SIMS `postgres` user
  -- Note: The `update_user` column is hardcoded to NULL
  -- Note: The `revision_count` column is hardcoded to 0
  --
  dtrecord_added as create_date,
  NULL::timestamptz as update_date,
  (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'postgres') as create_user,
  NULL::integer as update_user,
  0 as revision_count
INTO TABLE sims_bctw.telemetry_credential_lotek
FROM bctw.api_lotek_credential;

--------------------------------------------------------------------------------------------------------------
-- Create SIMS telemetry_credential_vectronic table
--------------------------------------------------------------------------------------------------------------

ALTER table biohub.telemetry_credential_vectronic ALTER column idcom SET DATA TYPE VARCHAR(50);

SELECT
	idcollar,
  comtype,
	idcom,
	collarkey,
	collartype,
  --
  -- Audit Columns
  --
  -- Note: The `create_date` is hardcoded to the current date (no date in the BCTW table)
  -- Note: The `update_date` is hardcoded to NULL
  -- Note: The `create_user` column is hardcoded to the SIMS `postgres` user
  -- Note: The `update_user` column is hardcoded to NULL
  -- Note: The `revision_count` column is hardcoded to 0
  --
  now()::timestamptz as create_date,
  NULL::timestamptz as update_date,
  (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'postgres') as create_user,
  NULL::integer as update_user,
  0 as revision_count
INTO TABLE sims_bctw.telemetry_credential_vectronic
FROM bctw.api_vectronic_credential;

--------------------------------------------------------------------------------------------------------------
-- Create SIMS telemetry_ats table
--------------------------------------------------------------------------------------------------------------

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
	activity,
  --
  -- Audit Columns
  --
  -- Note: The `create_date` is hardcoded to the current date
  -- Note: The `update_date` is hardcoded to NULL
  -- Note: The `create_user` column is hardcoded to the SIMS `postgres` user
  -- Note: The `update_user` column is hardcoded to NULL
  -- Note: The `revision_count` column is hardcoded to 0
  --
  now()::timestamptz as create_date, -- question: Should this be the `date` column? I think its the date the telemetry was recorded.
  NULL::timestamptz as update_date,
  (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'postgres') as create_user,
  NULL::integer as update_user,
  0 as revision_count
INTO TABLE sims_bctw.telemetry_ats
FROM bctw.telemetry_api_ats;

--------------------------------------------------------------------------------------------------------------
-- Create SIMS device table
--------------------------------------------------------------------------------------------------------------

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
  CONCAT_WS( ' + ','2025: BCTW -> SIMS Data Migration', bctw_collar.device_comment, bctw_collar.malfunction_comment) as comment,
  --
  -- Audit Columns
  --
  -- Note: The `create_date` is the `created_at` date from the BCTW table
  -- Note: The `update_date` is the `updated_at` date from the BCTW table
  -- Note: The `create_user` column is the BCTW user ID mapped to the SIMS user ID OR the SIMS `postgres` user
  -- Note: The `update_user` column is the BCTW user ID mapped to the SIMS user ID OR the SIMS `postgres` user
  -- Note: The `revision_count` column is hardcoded to 0
  --
  bctw_collar.created_at as create_date,
  bctw_collar.updated_at as update_date,
  sims_bctw.convert_bctw_user_to_sims_user(bctw_collar.created_by_user_id, false) as create_user,
  sims_bctw.convert_bctw_user_to_sims_user(bctw_collar.updated_by_user_id, true) as update_user,
  0 as revision_count
INTO TABLE sims_bctw.device
FROM bctw.collar bctw_collar
WHERE bctw.is_valid(bctw_collar.valid_to)
AND device_make IS NOT NULL;
