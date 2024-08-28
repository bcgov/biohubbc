import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformStudyAreas = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Study Area');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Transforms SPI Study Areas into SIMS Survey Locations 
    -------------------------------------------------------------------------------------------------
INSERT INTO 
    biohub.survey_locations (survey_id, name, description)
SELECT 
    b.survey_id, 
    sa.study_area_name AS name, 
    sa.study_area_description AS description
FROM 
    public.spi_survey_study_areas ss
JOIN
    public.spi_study_areas sa ON ss.spi_project_id = sa.spi_project_id
JOIN
    biohub.survey b ON ss.survey_id = b.spi_survey_id;

  `;

  await connection.sql(sql);

  console.log('Successfully transformed study areas');
};
