import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSampleVisits = async (connection: IDBConnection): Promise<void> => {
  const transformSampleVisitsSql = SQL`
    set search_path = biohub,public;

------ transforming design component visits into sampling periods --- 
    INSERT INTO biohub.survey_sample_period (create_date, survey_sample_method_id, start_date, end_date, start_time, end_time)
    SELECT 
        sdcv.when_created, 
        ssm.survey_sample_method_id,  -- Retrieved from the joined tables
        MIN(DATE(sdcv.visit_date)) AS start_date,  
        MAX(DATE(sdcv.visit_date)) AS end_date,    
        TO_TIMESTAMP(CASE WHEN LENGTH(sdcv.start_time) = 4 
            THEN sdcv.start_time ELSE LPAD(sdcv.start_time, 4, '0') END, 'HH24MI')::time AS start_time, 
        COALESCE(
            TO_TIMESTAMP(CASE WHEN LENGTH(sdcv.end_time) = 4 
                THEN sdcv.end_time ELSE LPAD(sdcv.end_time, 4, '0') END, 'HH24MI')::time,
            MAX(sdcv.visit_date)::time 
        ) AS end_time
    FROM 
        public.spi_design_component_visits sdcv
    JOIN 
        public.migrate_spi_sample_design_component msd
        ON sdcv.design_component_id = msd.design_component_id
    JOIN 
        biohub.survey_sample_method ssm
        ON msd.survey_sample_site_id = ssm.survey_sample_site_id
    GROUP BY 
        sdcv.design_component_visit_id, 
        sdcv.when_created, 
        sdcv.start_time, 
        sdcv.end_time, 
        ssm.survey_sample_method_id;
    `;

  await connection.sql(transformSampleVisitsSql);

  console.log('Successfully transformed design component visits');
};
