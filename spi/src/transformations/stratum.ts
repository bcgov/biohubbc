import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformUsersSql = SQL`
-------------------------------------------------------------------------------------------------
-- Moving stratum data from SPI to SIMS to show the stratum that a Design Component is in for a particular survey.

-- This is all the columns in SPI right now. doubt we will need all of them(?) so Ive commented out update date, but this is just a start.

-- Create stratum
-------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.survey_stratum (survey_id, name, description, create_date, update_date)
    SELECT 
        s.survey_id,
        st.stratum_name,
        st.stratum_description,
        st.when_created,
        st.when_updated
    FROM 
        public.spi_survey_stratums st
    JOIN 
        biohub.survey s 
    ON 
        s.spi_survey_id = st.survey_id;


  await connection.sql(sql);`

  console.log('Successfully transformed stratums');
};
