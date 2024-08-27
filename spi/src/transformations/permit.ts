import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformPermits = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Permits');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Inserts permits for transformed surveys, if the permit value is a number or comma-separated list of numbers
    -------------------------------------------------------------------------------------------------
    WITH w_surveys AS (
        SELECT
            s.survey_id,
            trim(unnest(string_to_array(ss.wildlife_permit_label, ','))) AS permit_number
        FROM
            public.spi_surveys ss
        INNER JOIN 
            biohub.survey s ON ss.survey_id = s.spi_survey_id
        WHERE
            ss.wildlife_permit_label IS NOT NULL
    ), w_valid_permits AS (
      SELECT 
        survey_id, 
        CASE
            WHEN permit_number ~ '^[0-9]+$' THEN permit_number::integer
            ELSE NULL
        END AS permit_number
      from 
        w_surveys
    )
    INSERT INTO biohub.permit (survey_id, number, type)
    SELECT DISTINCT
        survey_id, 
        permit_number,
        'Wildlife Permit - General'
    FROM 
        w_valid_permits
    WHERE 
        permit_number is not null;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed permits');
};
