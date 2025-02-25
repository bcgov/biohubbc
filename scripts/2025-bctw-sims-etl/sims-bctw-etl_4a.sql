drop table if exists sims_bctw.final_device_deployment;

--------------------------------------------------------------------------------------------------------------
-- Combine and transform final mismatched and final matched tables
--------------------------------------------------------------------------------------------------------------

WITH w_combined_data AS (
  SELECT
    *
  FROM
    sims_bctw.final_matched_device_deployment
  UNION ALL
  select
    *
  from
    sims_bctw.final_mismatched_device_deployment
    where
    final_mismatched_device_deployment.bctw_deployment_uuid not in (
      select
        bctw_deployment_uuid
      from
        final_matched_device_deployment
    )
)
SELECT
  survey_id,
  deployment_id,
  bctw_deployment_id,
  critter_id,
  device_id as serial,
  device_model as model,
  frequency,
  CASE
    WHEN frequency IS NOT NULL THEN
    COALESCE(
      -- attempt to match the frequency unit from bctw to sims
      (SELECT
        biohub.frequency_unit.frequency_unit_id
      FROM
        biohub.frequency_unit
      WHERE
        biohub.frequency_unit.name ilike (
          SELECT
            code_name
          FROM
            bctw.code
          WHERE
            code_id = w_combined_data.frequency_unit::integer
        )
      ),
      -- if no match, and record has a frequency value default to 'mhz'
      (SELECT frequency_unit_id FROM biohub.frequency_unit WHERE biohub.frequency_unit.name = 'mhz')
    )
    ELSE null
  END AS frequency_unit,
  attachment_start::date as attachment_start_date, -- casting to `date` correct?
  attachment_start::time as attachment_start_time,
  attachment_end::date as attachment_end_date, -- cating to `date` correct?
  attachment_end::time as attachment_end_time,
  critterbase_start_capture_id,
  critterbase_end_capture_id,
  critterbase_end_mortality_id,
  coalesce(
    (
      SELECT
        biohub.device_make.device_make_id
      FROM
        biohub.device_make
      WHERE
        biohub.device_make.name ilike (
          SELECT
            code_name
          FROM
            bctw.code
          WHERE
            code_id = w_combined_data.device_make::integer
        )
      ),
      (
        SELECT
          biohub.device_make.device_make_id
        from
          biohub.device_make
        where
          biohub.device_make.name ilike 'LOTEK'
      )
  ) as device_make_id,
  device_model,
  comment
INTO TABLE
  sims_bctw.final_device_deployment
FROM
  w_combined_data;

--------------------------------------------------------------------------------------------------------------
-- Insert final data into SIMS
--------------------------------------------------------------------------------------------------------------
set search_path = biohub;

alter table biohub.deployment add column if not exists bctw_deployment_id uuid;

-- Insert data into device
WITH
w_deduplicated_devices as (
    SELECT
        survey_id,
        serial,
        device_make_id,
        model,
        comment
    FROM
        sims_bctw.final_device_deployment
    where not exists (
        SELECT
            1
        FROM
            biohub.device
        WHERE
            survey_id = final_device_deployment.survey_id
            AND serial = final_device_deployment.serial
            AND device_make_id = final_device_deployment.device_make_id
    )
    GROUP BY
        survey_id,
        serial,
        device_make_id,
        model,
        comment
)
  INSERT INTO biohub.device (
    survey_id,
    serial,
    device_make_id,
    model,
    comment
  )
  SELECT
    survey_id,
    serial,
    device_make_id,
    model,
    comment
  FROM
    w_deduplicated_devices;

-- This is the only record that has a start date before the end date. Assuming they entered the dates in the wrong field, swapping them to resolve the issue.
UPDATE sims_bctw.final_device_deployment
SET
  attachment_start_date = sims_bctw.final_device_deployment.attachment_end_date,
  attachment_end_date = sims_bctw.final_device_deployment.attachment_start_date,
  attachment_start_time = sims_bctw.final_device_deployment.attachment_end_time,
  attachment_end_time = sims_bctw.final_device_deployment.attachment_start_time
WHERE
  serial = '84229';

-- Insert data into deployment
INSERT INTO biohub.deployment (
  bctw_deployment_id, -- temporary column to store the bctw deployment id for manual telemetry ref
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
SELECT
  final_device_deployment.bctw_deployment_id,
  final_device_deployment.survey_id,
  final_device_deployment.critter_id,
  biohub.device.device_id,
  final_device_deployment.frequency,
  final_device_deployment.frequency_unit,
  final_device_deployment.attachment_start_date::date,
  final_device_deployment.attachment_start_time::time,
  final_device_deployment.attachment_end_date::date,
  final_device_deployment.attachment_end_time::time,
  final_device_deployment.critterbase_start_capture_id,
  final_device_deployment.critterbase_end_capture_id,
  final_device_deployment.critterbase_end_mortality_id
FROM
  sims_bctw.final_device_deployment
INNER JOIN
  biohub.device
ON
  final_device_deployment.survey_id = biohub.device.survey_id
AND
  final_device_deployment.serial = biohub.device.serial
AND
  final_device_deployment.device_make_id = biohub.device.device_make_id;
