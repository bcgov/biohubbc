DROP TABLE IF EXISTS sims_bctw.telemetry_historic;

--------------------------------------------------------------------------------------------------------------
-- Create sims_bctw.telemetry_historic table
--------------------------------------------------------------------------------------------------------------

SELECT
    *
INTO TABLE 
    sims_bctw.telemetry_historic
FROM 
    bctw.telemetry_manual_historic;