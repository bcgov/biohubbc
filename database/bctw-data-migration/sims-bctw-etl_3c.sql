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

SELECT *
INTO sims_bctw.final_matched_device_deployment
FROM bctw.matched_sims_deployments
INNER JOIN bctw.flattened_valid_collar_deployment
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_valid_collar_deployment.bctw_deployment_uuid;
