import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSamplingMethods = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Methods');
  
    const sql = SQL`
-------------------------------------------------------------------------------------------------
-- Methods is gonna be a tricky one
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


  await connection.sql(sql);`

  console.log('Successfully transformed sampling methods');
};
