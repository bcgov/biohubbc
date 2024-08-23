import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSamplingMethods = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Methods');
  
    const sql = SQL`
-------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.target_sampling_site
    SELECT *

    FROM 
        public.destination_sampling_site
    JOIN 
        biohub.survey s 
    ON 
        s.spi_survey_id = st.survey_id;

    `;

  await connection.sql(transformSampleSitesSql);

  console.log('Successfully transformed Sampling Methods');
};