-- drop table if exists sims_bctw.final_mismatched_device_deployment;
drop table if exists sims_bctw.final_unresolved_matched_device_deployment;

---------------------------------------------------------------------------------------------------------------
-- Valid Device and Deployment ETL
-- Insert valid devices and deployments into the staging table `sims_bctw.final_matched_device_deployment`
--
-- Record count: 1909 / 1943 (34 remaining)
--------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS sims_bctw.final_matched_device_deployment;

-- Insert happy path records
SELECT *
INTO sims_bctw.final_matched_device_deployment
FROM bctw.matched_sims_deployments
INNER JOIN bctw.flattened_valid_collar_deployment
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_valid_collar_deployment.bctw_deployment_uuid;

-- Insert where the deployment is valid, but the collar is invalid
insert into sims_bctw.final_matched_device_deployment
SELECT *
FROM bctw.matched_sims_deployments
INNER JOIN bctw.flattened_invalid_collar_valid_deployment
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_invalid_collar_valid_deployment.bctw_deployment_uuid
AND bctw.matched_sims_deployments.deployment_id NOT IN (SELECT deployment_id FROM sims_bctw.final_matched_device_deployment);

-- Insert where the deployment is invalid, but the collar is valid
insert into sims_bctw.final_matched_device_deployment
SELECT *
FROM bctw.matched_sims_deployments
INNER JOIN bctw.flattened_valid_collar_invalid_deployment
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_valid_collar_invalid_deployment.bctw_deployment_uuid
AND bctw.matched_sims_deployments.deployment_id NOT IN (SELECT deployment_id FROM sims_bctw.final_matched_device_deployment);

-- Insert where the deployment is invalid, and the collar is invalid (0 records)
insert into sims_bctw.final_matched_device_deployment
SELECT *
FROM bctw.matched_sims_deployments
INNER JOIN bctw.flattened_invalid_collar_deployment
ON bctw.matched_sims_deployments.bctw_deployment_id = bctw.flattened_invalid_collar_deployment.bctw_deployment_uuid
AND bctw.matched_sims_deployments.deployment_id NOT IN (SELECT deployment_id FROM sims_bctw.final_matched_device_deployment );

-- Insert the remaining unresolved records into a new table, so they may be manually resolved later (5 records)
-- 'unresolved' means that we were unable to automatically find a match in BCTW. A match may exist, but it will require human curation.
SELECT *
INTO TABLE sims_bctw.final_unresolved_matched_device_deployment
FROM bctw.matched_sims_deployments
WHERE bctw.matched_sims_deployments.deployment_id NOT IN (SELECT deployment_id FROM sims_bctw.final_matched_device_deployment);
