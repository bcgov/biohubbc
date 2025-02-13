-- Purpose: SQL to transform data from the BCTW to the SIMS database.

-- Steps to create export SQL:
  -- 1. Run query in DBeaver
  -- 2. Bottom of window select "Export Data"
  -- 3. Select "SQL INSERT statements" as the format
  -- 4. In the "Format settings" tab, select "Target table name" and modify to SIMS table name
  -- 5. Select "Proceed" to export the data to local machine


-- BCTW table: api_lotek_credential
-- SIMS table: lotek_credential

-- This generates the SQL to transform the data from the BCTW
-- table `api_lotek_credential` to the SIMS table `lotek_credential`.

-- Question 1: Is the `is_valid` column all true?

-- Question 2: What is the value of `verified_date`?
  -- Todays date (the date the data was migrated)?
  -- The date the data was created in BCTW?

SELECT
  ndeviceid,
  strspecialid,
  dtcreated,
  strsatellite,
  true AS is_valid,
  now() AS verified_date
FROM bctw.api_lotek_credential;
