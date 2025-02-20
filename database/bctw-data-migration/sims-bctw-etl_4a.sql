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
)
SELECT
  survey_id,
  deployment_id,
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
        select
          code_id::text
        from
          bctw.code
        where
          bctw.code.code_name ilike 'LOTEK'
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
),
w_insert_device AS (
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
    w_deduplicated_devices
  RETURNING 
    *
)
-- Insert data into deployment
INSERT INTO biohub.deployment (
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
  final_device_deployment.survey_id,
  final_device_deployment.critter_id,
  w_insert_device.device_id,
  final_device_deployment.frequency,
  final_device_deployment.frequency_unit,
  final_device_deployment.attachment_start_date,
  final_device_deployment.attachment_start_time,
  final_device_deployment.attachment_end_date,
  final_device_deployment.attachment_end_time,
  final_device_deployment.critterbase_start_capture_id,
  final_device_deployment.critterbase_end_capture_id,
  final_device_deployment.critterbase_end_mortality_id
FROM 
  sims_bctw.final_device_deployment
INNER JOIN
  w_insert_device
ON
  final_device_deployment.survey_id = w_insert_device.survey_id
AND
  final_device_deployment.serial = w_insert_device.serial
AND
  final_device_deployment.device_make_id = w_insert_device.device_make_id;