--------------------------------------------------------------------------------------------------------------
-- Insert telemetry credentials into the final_survey_telemetry_vendor_credential table, for all deployments that 
-- were imported from BCTW.
--------------------------------------------------------------------------------------------------------------
WITH 
w_vendor_credentials AS (
  SELECT device_key FROM telemetry_credential_lotek
  UNION ALL
  SELECT device_key FROM telemetry_credential_vectronic
)
SELECT 
  deployment.survey_id, 
  deployment.device_key
INTO TABLE sims_bctw.final_survey_telemetry_vendor_credential (
  survey_id, 
  device_key
)
FROM 
  biohub.deployment
WHERE 
  deployment.device_key IN (
    SELECT device_key FROM w_vendor_credentials
  )
ON CONFLICT (survey_id, device_key) DO NOTHING;


--------------------------------------------------------------------------------------------------------------
-- Insert telemetry credentials into the survey_telemetry_vendor_credential table, for all deployments that 
-- were imported from BCTW.
--------------------------------------------------------------------------------------------------------------
INSERT INTO biohub.survey_telemetry_vendor_credential (
    survey_id, 
    device_key
) 
SELECT 
    survey_id, 
    device_key
FROM 
    sims_bctw.final_survey_telemetry_vendor_credential;