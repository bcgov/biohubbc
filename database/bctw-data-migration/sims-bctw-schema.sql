--------------------------------------------------------------------------------------------------------------
--
-- Questions?
--
-- 1. What user should we use for the `create_user` and `update_user` columns in the SIMS tables? `postgres` user?
-- 2. What is the value of the `verified_date` column in the telemetry_credential_lotek table?
-- 3. What is the value of the `is_valid` column in the telemetry_credential_lotek table?
--
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
DROP TABLE IF EXISTS sims_bctw.telemetry_historic;

--------------------------------------------------------------------------------------------------------------
-- Create function to map a BCTW user ID a SIMS user ID
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
      ON LOWER(su.user_guid) = LOWER(u.keycloak_guid)
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
  -- Note: The `create_date` is hardcoded to the current date
  -- Note: The `update_date` is hardcoded to NULL
  -- Note: The `create_user` column is hardcoded to the SIMS `postgres` user
  -- Note: The `update_user` column is hardcoded to NULL
  -- Note: The `revision_count` column is hardcoded to 0
  --
  now() as create_date,
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
-- Create SIMS telemetry manual historic
--------------------------------------------------------------------------------------------------------------

SELECT
  *,
  now()::timestamptz as create_date,
  NULL::timestamptz as update_date,
  (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'postgres') as create_user,
  NULL::integer as update_user,
  0 as revision_count
INTO TABLE sims_bctw.telemetry_historic
FROM bctw.telemetry_manual_historic;

--------------------------------------------------------------------------------------------------------------
-- Create SIMS deployment and device tables
--------------------------------------------------------------------------------------------------------------

-- Insert devices into the SIMS device table
-- Note: This does not current account for duplicate device serials for the same survey Either account for 
-- them, or else run a query after to strip them out.
with w_clean_bctw_device_deployment as (
  select
    *
  from
    new_deployment
  left join new_collar on
    new_collar.new_collar_id = new_deployment.new_collar_id
),
w_remove_duplicates as (
  select
    sims_survey_id,
    device_id,
    device_make,
    device_model,
    comment
  from
    w_clean_bctw_device_deployment
  group by
    sims_survey_id,
    device_id,
    device_make,
    device_model,
    comment
)
select
  w_remove_duplicates.sims_survey_id as survey_id,
  w_remove_duplicates.device_id as serial,
  w_remove_duplicates.device_model as model,
  coalesce(
    (
      select
        biohub.device_make.device_make_id
      from
        biohub.device_make
      where
        biohub.device_make.name ilike (
          select
            code_name
          from
            bctw.code
          where
            code_id = w_remove_duplicates.device_make::integer
        )
    ),
    (
      select
        biohub.device_make.device_make_id
      from
        biohub.device_make
      where
        biohub.device_make.name ilike 'lotek'
    )
  ) as device_make_id,
  w_remove_duplicates.comment as comment
into
  table sims_bctw.device
from
  w_remove_duplicates;

--------------------------------------------------------------------------------------------------------------

with w_clean_bctw_device_deployment as (
  select
    new_deployment.*,
    new_collar.new_collar_id,
    new_collar.bctw_collar_uuid,
    new_collar.device_make,
    new_collar.device_model,
    new_collar.device_id
  from
    new_deployment
  left join new_collar on
    new_collar.new_collar_id = new_deployment.new_collar_id
)
select 
  w_clean_bctw_device_deployment.sims_survey_id as survey_id,
  (
    select
      critter_id
    from
      biohub.critter
    where
      critter.critterbase_critter_id = w_clean_bctw_device_deployment.bctw_critter_uuid
  ) as critter_id,
  (
    -- Find the newly created device_id from the device table, based on the survey_id and device_id
    select
      device_id
    from
      sims_bctw.device
    where
      device.survey_id = w_clean_bctw_device_deployment.sims_survey_id
      and device.serial = w_clean_bctw_device_deployment.device_id
  ) as device_id,
  w_clean_bctw_device_deployment.frequency as frequency,
  (
    select
      frequency_unit.frequency_unit_id
    from
      biohub.frequency_unit
    where
      frequency_unit."name" ilike (
        select
          code.code_name
        from
          bctw.code
        where
          code.code_id = w_clean_bctw_device_deployment.frequency_unit::integer
      )
  ) as frequency_unit,
  w_clean_bctw_device_deployment.attachment_start as attachment_start_date,
  w_clean_bctw_device_deployment.attachment_start as attachment_start_time,
  w_clean_bctw_device_deployment.attachment_end as attachment_end_date,
  w_clean_bctw_device_deployment.attachment_end as attachment_end_time
into
  table sims_bctw.deployment
from
  w_clean_bctw_device_deployment;