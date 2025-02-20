DROP TABLE IF EXISTS sims_bctw.telemetry_credential_lotek;
DROP TABLE IF EXISTS sims_bctw.telemetry_credential_vectronic;
DROP TABLE IF EXISTS sims_bctw.telemetry_ats;

--------------------------------------------------------------------------------------------------------------
-- Create sims_bctw.telemetry_credential_lotek table
--------------------------------------------------------------------------------------------------------------

SELECT
    ndeviceid,
    strspecialid,
    dtcreated,
    strsatellite,
    true AS is_valid, -- question: Are all records valid?
    now() AS verified_date, -- question: Is this the current date?,
    NULL as "key"
INTO TABLE 
    sims_bctw.telemetry_credential_lotek
FROM 
    bctw.api_lotek_credential;


--------------------------------------------------------------------------------------------------------------
-- Create sims_bctw.telemetry_credential_vectronic table
--------------------------------------------------------------------------------------------------------------

SELECT
    idcollar,
    comtype,
    idcom,
    collarkey,
    collartype
INTO TABLE 
    sims_bctw.telemetry_credential_vectronic
FROM 
    bctw.api_vectronic_credential;


--------------------------------------------------------------------------------------------------------------
-- Create sims_bctw.telemetry_ats table
--------------------------------------------------------------------------------------------------------------

SELECT
    collarserialnumber,
    "date",
    numberfixes,
    battvoltage,
    mortality,
    breakoff,
    gpsontime,
    satontime,
    saterrors,
    gmtoffset,
    lowbatt,
    "event",
    latitude,
    longitude,
    cepradius_km,
    temperature,
    hdop,
    numsats,
    fixtime,
    activity
INTO TABLE 
    sims_bctw.telemetry_ats
FROM 
    bctw.telemetry_api_ats;