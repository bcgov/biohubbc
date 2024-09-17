import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSurveyStratums = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Survey Stratums');
  const transformSurveyStratumsSql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Create stratum to do
    -------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.survey_stratum (survey_id, name, description, create_date)
    SELECT 
        s.survey_id,
        st.stratum_name,
        COALESCE(st.stratum_description, 'Migrated from SPI'),
        st.when_created
    FROM 
        public.spi_survey_stratums st
    JOIN 
        biohub.survey s
    ON 
        s.spi_survey_id = st.survey_id;
  `;

  await connection.sql(transformSurveyStratumsSql);

  console.log('Successfully transformed survey stratums');
};
