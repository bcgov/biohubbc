import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformUsersSql = SQL`
-------------------------------------------------------------------------------------------------
-- Moving stratum data from SPI to SIMS to show the stratum that a Design Component is in for a particular survey.

-- This is all the columns in SPI right now. doubt we will need all of them(?) so Ive commented out update date, but this is just a start.

-- Create stratum
-------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.stratum (spi_project_id, survey_id, study_area, design_component_id, stratum_name, create_date, create_id)
    SELECT 
        st.spi_project_id,
        st.survey_id,
        st.study_area_id,
        st.design_component_id,
        st.stratum_name,
        st.when_created,
        st.who_created, 
        -- st.who_updated,
        -- st.when_updated
    FROM 
        public.spi_component_stratums st;

  await connection.sql(sql);`

  console.log('Successfully transformed stratums');
};
