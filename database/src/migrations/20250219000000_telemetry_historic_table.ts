import { Knex } from 'knex';

/**
 * 1. Adds the new `telemetry_historic` table to the database.
 * 2. Alters the `key` column in the `telemetry_credential_lotek` table to allow null values.
 *
 * Rationale: This table will store historical telemetry data from the 2025 BCTW -> SIMS data migration.
 *
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Alter telemetry_credential_lotek 'key' column type to allow null values
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    ALTER TABLE telemetry_credential_lotek ALTER COLUMN "key" DROP NOT NULL;

    ----------------------------------------------------------------------------------------
    -- Create new telemetry historic table
    ----------------------------------------------------------------------------------------

    CREATE TABLE biohub.telemetry_historic (
    telemetry_historic_id   uuid          DEFAULT public.gen_random_uuid() NOT NULL,
    region                  text          NULL,    -- Region within province the animal inhabits. ex. Peace
    project                 text          NULL,    -- The project that each telemetry record belongs to in the Species Inventory (SPI) database maintained by the Ministry of Water, Land, and Resource Stewardship.
    species                 text          NULL,    -- Identifies a species or subspecies of wildlife.
    ecotype                 text          NULL,    -- The ecotype classification that the individual caribou belongs to. The three ecotypes (Mountain, Northern, and Boreal) are groups of ecologically similar caribou populations.
    population_unit         text          NULL,    -- Population unit is a generic term for a provincially defined, geographically discrete population of Caribou.
    population_unit_id      int4          NULL,    -- The unique identifier given to each caribou population unit (herd) in British Columbia, as determined by the Provincial Caribou Recovery Program.
    management_area         text          NULL,    -- Similar to population unit, but is more generic and used for many species.
    wlh_id                  text          NULL,    -- A unique identifier assigned to an individual by the B. C. Wildlife Health Program, independent of possible changes in mark method used, to assoicate health data to the indiviudal.
    animal_id               text          NULL,    -- A unique identifier permanently assigned to an animal by the project coordinator, independent of possible changes in mark method used. This data is mandatory if there is telemetry or GPS data for the animal.  Field often contains text and numbers.
    device_id               text          NULL,    -- An identifying number or label (e.g. serial number) that the manufacturer of a device has applied to the device.
    frequency               float8        NULL,  -- The frequency of electromagnetic signal emitted by a tag or mark.
    collar_type             text          NULL,    -- The signal transmission mode of the telemetry device, such as VHF or GPS.
    collar_make             text          NULL,    -- The manufacturer of the telemetry device
    collar_model            text          NULL,    -- The specific model of telemetry device, provided by the device manufacturer, that generated the telemetry data
    dop                     float8        NULL,  -- Dilution of precision
    fix_date_time           text          NULL,    -- The date and time when the animal occurred at a given location
    year_                   int4          NULL,    -- Year from time signature
    month_                  int4          NULL,    -- Month from time signature
    day_                    int4          NULL,    -- Day from time signature
    time_                   text          NULL,    -- Time signature of when the telemetry point was captured
    latitude                float8        NULL,  -- North-South position along surface of the Earth. WGS 84.
    longitude               float8        NULL,  -- East-West position along the surface of the Earth. WGS 84.
    albers_x                float8        NULL,  -- Equal area map projection that uses two standard parallels. X axis.
    albers_y                float8        NULL,  -- Equal area map projection that uses two standard parallels. Y axis.
    original_file_location  text          NULL,    -- Original file location of the telemetry
    exists_kmb_tracking     text          NULL,    -- Indicator if kmp tracking exists for this animal/telemetry observation

    CONSTRAINT telemetry_historic_pk PRIMARY KEY (telemetry_historic_id)
  );

  ----------------------------------------------------------------------------------------
  -- Comment on table
  ----------------------------------------------------------------------------------------
  COMMENT ON TABLE biohub.telemetry_historic IS 'Non-SPI historical telemetry';

  COMMENT ON COLUMN biohub.telemetry_historic.telemetry_historic_id IS 'The telemetry historic unique record identifier';
  COMMENT ON COLUMN biohub.telemetry_historic.region IS 'Region within province the animal inhabits. ex. Peace';
  COMMENT ON COLUMN biohub.telemetry_historic.project IS 'The project that each telemetry record belongs to in the Species Inventory (SPI) database maintained by the Ministry of Water, Land, and Resource Stewardship.';
  COMMENT ON COLUMN biohub.telemetry_historic.species IS 'Identifies a species or subspecies of wildlife.';
  COMMENT ON COLUMN biohub.telemetry_historic.ecotype IS 'The ecotype classification that the individual caribou belongs to. The three ecotypes (Mountain, Northern, and Boreal) are groups of ecologically similar caribou populations.';
  COMMENT ON COLUMN biohub.telemetry_historic.population_unit IS 'Population unit is a generic term for a provincially defined, geographically discrete population of Caribou.';
  COMMENT ON COLUMN biohub.telemetry_historic.population_unit_id IS 'The unique identifier given to each caribou population unit (herd) in British Columbia, as determined by the Provincial Caribou Recovery Program.';
  COMMENT ON COLUMN biohub.telemetry_historic.management_area IS 'Similar to population unit, but is more generic and used for many species.';
  COMMENT ON COLUMN biohub.telemetry_historic.wlh_id IS 'A unique identifier assigned to an individual by the B. C. Wildlife Health Program, independent of possible changes in mark method used, to assoicate health data to the indiviudal.';
  COMMENT ON COLUMN biohub.telemetry_historic.animal_id IS 'A unique identifier permanently assigned to an animal by the project coordinator, independent of possible changes in mark method used. This data is mandatory if there is telemetry or GPS data for the animal.  Field often contains text and numbers.';
  COMMENT ON COLUMN biohub.telemetry_historic.device_id IS 'An identifying number or label (e.g. serial number) that the manufacturer of a device has applied to the device.';
  COMMENT ON COLUMN biohub.telemetry_historic.frequency IS 'The frequency of electromagnetic signal emitted by a tag or mark.';
  COMMENT ON COLUMN biohub.telemetry_historic.collar_type IS 'The signal transmission mode of the telemetry device, such as VHF or GPS.';
  COMMENT ON COLUMN biohub.telemetry_historic.collar_make IS 'The manufacturer of the telemetry device';
  COMMENT ON COLUMN biohub.telemetry_historic.collar_model IS 'The specific model of telemetry device, provided by the device manufacturer, that generated the telemetry data';
  COMMENT ON COLUMN biohub.telemetry_historic.dop IS 'Dilution of precision';
  COMMENT ON COLUMN biohub.telemetry_historic.fix_date_time IS 'The date and time when the animal occurred at a given location';
  COMMENT ON COLUMN biohub.telemetry_historic.year_ IS 'Year from time signature';
  COMMENT ON COLUMN biohub.telemetry_historic.month_ IS 'Month from time signature';
  COMMENT ON COLUMN biohub.telemetry_historic.day_ IS 'Day from time signature';
  COMMENT ON COLUMN biohub.telemetry_historic.time_ IS 'Time signature of when the telemetry point was captured';
  COMMENT ON COLUMN biohub.telemetry_historic.latitude IS 'North-South position along surface of the Earth. WGS 84.';
  COMMENT ON COLUMN biohub.telemetry_historic.longitude IS 'East-West position along the surface of the Earth. WGS 84.';
  COMMENT ON COLUMN biohub.telemetry_historic.albers_x IS 'Equal area map projection that uses two standard parallels. X axis.';
  COMMENT ON COLUMN biohub.telemetry_historic.albers_y IS 'Equal area map projection that uses two standard parallels. Y axis.';
  COMMENT ON COLUMN biohub.telemetry_historic.original_file_location IS 'Original file location of the telemetry';
  COMMENT ON COLUMN biohub.telemetry_historic.exists_kmb_tracking IS 'Indicator if kmp tracking exists for this animal/telemetry observation';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
