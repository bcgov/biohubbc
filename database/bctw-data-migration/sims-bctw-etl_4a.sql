--------------------------------------------------------------------------------------------------------------
-- Combine and transform final mismatched and final matched tables
--------------------------------------------------------------------------------------------------------------

-- TODO

--------------------------------------------------------------------------------------------------------------
-- Insert final data into SIMS
--------------------------------------------------------------------------------------------------------------

-- Insert data into device
WITH w_insert_device AS (
  INSERT INTO biohub.device (
    survey_id,
    serial,
    device_make_id,
    model,
    comment
  ) 
  SELECT (
    survey_id,
    serial,
    device_make_id,
    model,
    comment
  ) 
  FROM 
    sims_bctw.final_device_deployment
  RETURNING 
    *
),
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
SELECT (
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
FROM 
  final_device_deployment
INNER JOIN
  w_insert_device
ON
  final_device_deployment.survey_id = w_insert_device.survey_id
AND
  final_device_deployment.serial = w_insert_device.serial
AND
  final_device_deployment.device_make_id = w_insert_device.device_make_id;