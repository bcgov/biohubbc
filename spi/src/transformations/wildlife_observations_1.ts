import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformWildlifeObservations = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Wildlife Observations');
  const transformWildlifeObservationsSql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Create Wildlife Observations into sims observations table 
    -------------------------------------------------------------------------------------------------
    -- creating a new table to hold the wlo_id and the new survey_observation id to crosswalk spi to sims obs
    -- primary key constrain on wlo_id ensures it will be unique and not null 

    CREATE TABLE IF NOT EXISTS public.migrate_spi_wildlife_observations (
    wlo_id INTEGER PRIMARY KEY,
    survey_observation_id INTEGER);
    
    -- populating survey_observation table -- 

    INSERT INTO 
        biohub.survey_observation so (survey_id, latitude, longitude, count, observation_date, observation_time, create_date, survey_sample_site_id, survey_sample_method_id, survey_sample_period_id)
    SELECT
        s.survey_id,
        swo.latitude,
        swo.longitude, 
        swo.wlo_count, 
        -- date/time may need to be retrieved from sampling site visit  -- public.migrate_spi_sample_period_visit
        swo.when_created, 
        mssdc.survey_sample_site_id, 
        ssm.survey_sample_method_id, 
        ssp.survey_sample_period_id
 
    FROM 
        public.spi_wildlife_observations swo
    JOIN 
        biohub.survey s
    ON 
        s.spi_survey_id = swo.survey_id
    JOIN 
        public.migrate_spi_sample_design_component mssdc
    ON 
        swo.design_component_id = mssdc.design_component_id
    JOIN 
        biohub.survey_sample_method ssm
    ON 
        ssm.survey_sample_site_id = mssdc.survey_sample_site_id
    JOIN 
        biohub.survey_sample_period ssp
    ON 
        ssp.survey_sample_method_id = ssm.survey_sample_method_id
    JOIN 
        public.migrate_spi_sample_period_visit msspv
    ON 
        msspv.design_component_visit_id = swo.design_component_visit_id
    RETURNING swo.wlo_id, so.survey_observation_id;
    

    --- insert with statement 
    WITH w_inserted AS(
    -- copy intert statement sql above through to returning and paste in brackets here)

    -- inserting the w_inserted into the newly created table 
    INSERT INTO 
        public.migrate_spi_wildlife_observations (wlo_id, survey_observation_id)
    SELECT 
        wlo_id, survey_observation_id
    FROM 
        w_inserted;
  `;

  await connection.sql(transformWildlifeObservationsSql);

  console.log('Successfully transformed Wildlife Observations');
};
