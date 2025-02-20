-- Tables to use:
-- bctw.matched_sims_deployments - Might not need
-- bctw.valid_collar_deployment
-- bctw.flattened_valid_collar_deployment - Both the collar and deployment are valid
-- bctw.invalid_collar_deployment
-- plus any other intermediate, etc tables that are needed. (use any tables in sims-bctw-etl_3a.sql)

-- match all the perfect ones
-- match all the ones where the deployment is happy
-- match all the ones where the collar is happy?

-- join to the matched_sims_deployments table
-- Insert the valid devices
-- INSERT INTO biohub.device (
--   survey_id,
--   serial,
--   device_make_id,
--   model,
--   comment
-- )

---------------------------------------------------------------------------------------------------------------
-- Valid Device and Deployment ETL
-- Insert valid devices and deployments into the staging table `sims_bctw.final_matched_device_deployment`
--
-- Record count: 1622
--------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS sims_bctw.final_matched_device_deployment;

SELECT
  bctw.matched_sims_deployments.survey_id,
  bctw.matched_sims_deployments.deployment_id,
  bctw.matched_sims_deployments.critter_id,
  bctw.flattened_valid_collar_deployment.device_id as serial,
  bctw.flattened_valid_collar_deployment.frequency,
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
            code_id = flattened_valid_collar_deployment.frequency_unit::integer
        )
      ),
      -- if no match, and record has a frequency value default to 'mhz'
      (SELECT frequency_unit_id FROM biohub.frequency_unit WHERE biohub.frequency_unit.name = 'mhz')
    )
    ELSE null
  END AS frequency_unit,
  bctw.flattened_valid_collar_deployment.attachment_start::date as attachment_start_date, -- casting to `date` correct?
  bctw.flattened_valid_collar_deployment.attachment_start::time as attachment_start_time,
  bctw.flattened_valid_collar_deployment.attachment_end::date as attachment_end_date, -- cating to `date` correct?
  bctw.flattened_valid_collar_deployment.attachment_end::time as attachment_end_time,
  bctw.matched_sims_deployments.critterbase_start_capture_id,
  bctw.matched_sims_deployments.critterbase_end_capture_id,
  bctw.matched_sims_deployments.critterbase_end_mortality_id,
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
          code_id = flattened_valid_collar_deployment.device_make::integer
      )
  ) as device_make_id,
  bctw.flattened_valid_collar_deployment.device_model,
  bctw.flattened_valid_collar_deployment.comment
INTO sims_bctw.final_matched_device_deployment
FROM bctw.flattened_valid_collar_deployment
INNER JOIN bctw.matched_sims_deployments
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_valid_collar_deployment.bctw_deployment_uuid;
