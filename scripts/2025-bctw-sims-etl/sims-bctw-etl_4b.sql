drop table if exists sims_bctw.final_unresolved_device_deployment;

--------------------------------------------------------------------------------------------------------------
-- Combine and transform final unresolved mismatched and final unresolved matched tables
--------------------------------------------------------------------------------------------------------------

WITH w_combined_data AS (
  SELECT 
    *
  FROM
    sims_bctw.final_unresolved_matched_device_deployment
  UNION ALL
  select
    *
  from
    sims_bctw.final_unresolved_mismatched_device_deployment
)
SELECT
  *
INTO TABLE
  sims_bctw.final_unresolved_device_deployment
FROM 
  w_combined_data;
