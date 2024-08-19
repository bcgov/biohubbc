import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSurveyStratums = async (connection: IDBConnection): Promise<void> => {
  const transformSurveyStratumsSql = SQL`
-------------------------------------------------------------------------------------------------
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
`;
  await connection.sql(transformSurveyStratumsSql);

  console.log('Successfully transformed stratums');
};
