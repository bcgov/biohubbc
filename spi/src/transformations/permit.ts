import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformPermits = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Permits');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Transforms SPI permits associated with Surveys into SIMS Permits
    -------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.permit (survey_id, number, type, create_date)
    SELECT 
        s.survey_id, 
        ss.wildlife_permit_label,
        'Wildlife Permit - General',
        ss.when_created
    FROM 
        public.spi_surveys ss
    JOIN
        biohub.survey s ON s.spi_survey_id = ss.survey_id;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed permits');
};
