--------------------------------------------------------------------------------------------------------------
--
-- Import BCTW data into Biohub tables
-- Note: These tables require the least amount of transformation.
--
-- Biohub Tables:
--    - biohub.telemetry_credential_lotek
--    - biohub.telemetry_credential_vectronic
--    - biohub.telemetry_ats
--    - biohub.telemetry_historic
--
--------------------------------------------------------------------------------------------------------------
-- Set search path to biohub schema
--------------------------------------------------------------------------------------------------------------
SET SEARCH_PATH TO biohub;

--------------------------------------------------------------------------------------------------------------
-- Import data into biohub.telemetry_credential_lotek table
--------------------------------------------------------------------------------------------------------------
-- Patch to add missing column - PR branch missing this column - Production will have this
ALTER TABLE telemetry_credential_lotek ADD COLUMN IF NOT EXISTS key VARCHAR(1000);

INSERT INTO biohub.telemetry_credential_lotek (
  ndeviceid,
  strspecialid,
  dtcreated,
  strsatellite,
  verified_date,
  is_valid,
  key
  )
SELECT
  ndeviceid::int4,
  strspecialid::varchar(100),
  dtcreated::timestamptz(6),
  strsatellite::varchar(100),
  now()::timestamptz(6),
  true as is_valid,
  NULL as "key"
FROM bctw.api_lotek_credential
WHERE NOT EXISTS (SELECT 1 FROM biohub.telemetry_credential_lotek WHERE ndeviceid::int4 = biohub.telemetry_credential_lotek.ndeviceid);


--------------------------------------------------------------------------------------------------------------
-- Import data into biohub.telemetry_credential_vectronic table
--------------------------------------------------------------------------------------------------------------
INSERT INTO biohub.telemetry_credential_vectronic (
  idcollar,
  comtype,
  idcom,
  collarkey,
  collartype
  )
SELECT
  idcollar::int4,
  comtype::varchar(50),
  idcom::varchar(50),
  collarkey::varchar(1000),
  collartype::int4
FROM bctw.api_vectronic_credential
WHERE NOT EXISTS (SELECT 1 FROM biohub.telemetry_credential_vectronic WHERE idcollar::int4 = biohub.telemetry_credential_vectronic.idcollar);

--------------------------------------------------------------------------------------------------------------
-- Import data into biohub.telemetry_ats table
--------------------------------------------------------------------------------------------------------------
INSERT INTO biohub.telemetry_ats (
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
  )
SELECT
  collarserialnumber::int4,
  "date"::timestamptz,
  numberfixes::int4,
  battvoltage::float8,
  mortality::bool,
  breakoff::bool,
  gpsontime::int4,
  satontime::int4,
  saterrors::int4,
  gmtoffset::int4,
  lowbatt::bool,
  "event"::varchar(100),
  latitude::float8,
  longitude::float8,
  cepradius_km::int4,
  temperature::varchar,
  hdop::varchar,
  numsats::varchar,
  fixtime::varchar,
  activity::varchar
FROM bctw.telemetry_api_ats
WHERE NOT EXISTS (
    SELECT
      1
    FROM biohub.telemetry_ats
    WHERE collarserialnumber::int4 = biohub.telemetry_ats.collarserialnumber
    AND "date"::timestamptz = biohub.telemetry_ats."date"
  );

--------------------------------------------------------------------------------------------------------------
-- Import data into biohub.telemetry_historic table
--------------------------------------------------------------------------------------------------------------
INSERT INTO biohub.telemetry_historic (
  telemetry_historic_id,
  region,
  species,
  ecotype,
  population_unit,
  management_area,
  wlh_id,
  animal_id,
  device_id,
  frequency,
  collar_type,
  collar_make,
  collar_model,
  dop,
  fix_date_time,
  year_,
  month_,
  day_,
  latitude,
  longitude,
  albers_x,
  albers_y,
  original_file_location,
  exists_kmb_tracking
  )
SELECT
  id::uuid,
  region::text,
  species::text,
  ecotype::text,
  population_unit::text,
  management_area::text,
  wlh_id::text,
  animal_id::text,
  device_id::text,
  frequency::float8,
  collar_type::text,
  collar_make::text,
  collar_model::text,
  dop::float8,
  fix_date_time::text,
  year_::int4,
  month_::int4,
  day_::int4,
  latitude::float8,
  longitude::float8,
  albers_x::float8,
  albers_y::float8,
  orig_file_loc::text,
  exists_kmb_tracking::text
FROM bctw.telemetry_manual_historic
WHERE NOT EXISTS (SELECT 1 FROM biohub.telemetry_historic WHERE id::uuid = biohub.telemetry_historic.telemetry_historic_id);
