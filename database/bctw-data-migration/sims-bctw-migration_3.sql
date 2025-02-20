SET SEARCH_PATH=biohub;

truncate
  table biohub.deployment cascade;

truncate
  table biohub.device cascade;

-- Insert SIMS devices
insert
  into
  biohub.device (
    survey_id,
    serial,
    model,
    device_make_id,
    comment
  )
select
  survey_id,
  serial,
  model,
  device_make_id,
  comment
from
  sims_bctw.device;

-- Insert SIMS deployments
insert
  into
    biohub.deployment (
      survey_id,
      critter_id,
      device_id,
      frequency,
      frequency_unit_id,
      attachment_start_date,
      attachment_start_time,
      attachment_end_date,
      attachment_end_time,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
  )
    select
      sims_bctw.deployment.survey_id,
      sims_bctw.deployment.critter_id,
      biohub.device.device_id,
      frequency,
      case
        when frequency is not null then
          coalesce(
            frequency_unit,
            (
              select
                      frequency_unit_id
              from
                      frequency_unit
              where
                      name = 'mhz'
            )
          )
        else null
      end as frequency_unit,
      attachment_start_date,
      attachment_start_time,
      attachment_end_date,
      attachment_end_time,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
from
      sims_bctw.deployment
left join biohub.device
    on
      sims_bctw.deployment.survey_id = biohub.device.survey_id
  and
       sims_bctw.deployment.serial = biohub.device.serial
returning *;

--------------------------------------------------------------------------------------------------------------
-- Insert into SIMS telemetry_credential_lotek table
--------------------------------------------------------------------------------------------------------------

-- Net-new data: This can be safely truncated
TRUNCATE TABLE biohub.telemetry_credential_lotek CASCADE;

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
  verified_date::timestamptz(6),
  is_valid::bool,
  key::varchar(1000)
FROM sims_bctw.telemetry_credential_lotek;


--------------------------------------------------------------------------------------------------------------
-- Insert into SIMS telemetry_credential_vectronic table
--------------------------------------------------------------------------------------------------------------

--  TODO: Can this be safely truncated?
TRUNCATE TABLE biohub.telemetry_credential_vectronic CASCADE;

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
FROM sims_bctw.telemetry_credential_vectronic;


--------------------------------------------------------------------------------------------------------------
-- Insert into SIMS telemetry_ats table
--------------------------------------------------------------------------------------------------------------

-- Net-new data: This can be safely truncated
TRUNCATE TABLE biohub.telemetry_ats CASCADE;

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
FROM sims_bctw.telemetry_ats;

--------------------------------------------------------------------------------------------------------------
-- Insert into SIMS telemetry_historic
--------------------------------------------------------------------------------------------------------------
-- Net-new data: This can be safely truncated
TRUNCATE TABLE biohub.telemetry_historic CASCADE;

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
FROM sims_bctw.telemetry_historic;
