import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformStudyAreas = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Study Area');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Transforms SPI Study Areas into SIMS Survey Locations 
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.survey_location (survey_id, name, description, geography)
    SELECT 
        bs.survey_id, 
        sa.study_area_name, 
        sa.study_area_description,
        COALESCE(igd.geo, ST_ConvexHull(ST_Collect(ST_SetSRID(ST_MakePoint(wso.longitude, wso.latitude), 4326)))) AS geography
    FROM biohub.survey bs
    JOIN public.spi_survey_study_areas ssa
        ON bs.spi_survey_id = ssa.survey_id
    JOIN public.spi_study_areas sa
        ON ssa.study_area_id = sa.study_area_id
    JOIN public.spi_document_references sdr
        ON sa.study_area_id = sdr.study_area_id
    LEFT JOIN public.imported_geo_data igd
        ON sdr.document_reference_id = igd.spi_document_reference
    LEFT JOIN public.spi_wildlife_observations wso
        ON bs.spi_survey_id = wso.survey_id
    WHERE sa.study_area_id IS NOT NULL 
    AND wso.longitude IS NOT NULL 
    AND wso.latitude IS NOT null
    GROUP BY bs.survey_id, sa.study_area_name, sa.study_area_description, igd.geo;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed study areas');
};
