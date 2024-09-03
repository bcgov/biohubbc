import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSampleVisits = async (connection: IDBConnection): Promise<void> => {
  const transformSampleVisitsSql = SQL`
    set search_path = biohub,public;

------ transforming design component visits into sampling periods --- 
    INSERT INTO biohub.survey_sample_period (create_date, survey_sample_method_id, start_date, end_date, start_time, end_time)
    SELECT 
        sdcv.when_created, 
        ssm.survey_sample_method_id,
        DATE(sdcv.visit_date) AS start_date,
        DATE(COALESCE(sdcv.visit_end_date, sdcv.visit_date)) AS end_date,
        CASE 
            WHEN sdcv.start_time = '0000' THEN NULL
            ELSE TO_TIMESTAMP(LPAD(sdcv.start_time, 4, '0'), 'HH24MI')::time
        END AS start_time,
        CASE 
            WHEN sdcv.end_time = '0000' THEN NULL
            ELSE TO_TIMESTAMP(LPAD(sdcv.end_time, 4, '0'), 'HH24MI')::time
        END AS end_time
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
