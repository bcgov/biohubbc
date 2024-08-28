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
        igd.geo
    FROM biohub.survey bs
    JOIN public.spi_survey_study_areas ssa
        ON bs.spi_survey_id = ssa.survey_id
    JOIN public.spi_study_areas sa
        ON ssa.study_area_id = sa.study_area_id
    LEFT JOIN public.spi_document_references sdr
        ON sa.study_area_id = sdr.study_area_id
    LEFT JOIN public.imported_geo_data igd
        ON sdr.document_reference_id = igd.spi_document_reference
    WHERE sa.study_area_id IS NOT NULL;
-- ran into inflated datasets due to multiple surveys migration
-- ran into inflated datasets due to multiple unique document references per study area -- and naming repeating identically across these
-- to test modify these code setting where study area id is equal to 5264





-- ITS BROKEN -- FOR SOME REASON IT IS MANY-TO-MANY FRAKING OUT AND IS GOING EXPONENTIAL. PUBLIC.SPI_SURVEY_STUDY_AREAS HAS 7217 RECORDS. THE BELOW CODE IS RTURNING 2 MILLION ROWS. HELP.


INSERT INTO 
    biohub.survey_locations (survey_id, name, description, geography)
SELECT 
    b.survey_id, 
    sa.study_area_name AS name, 
    sa.study_area_description AS description,
    geo.geo AS geography
FROM 
    public.spi_survey_study_areas ss
JOIN
    public.spi_study_areas sa ON ss.spi_project_id = sa.spi_project_id
JOIN
    biohub.survey b ON ss.survey_id = b.spi_survey_id
JOIN
    public.spi_document_references dr ON sa.spi_project_id = dr.spi_project_id
JOIN
    public.imported_geo_data geo ON dr.document_reference_id = geo.spi_document_reference
WHERE 
    ss.spi_project_id = sa.spi_project_id
    AND b.spi_survey_id = ss.survey_id
    AND dr.spi_project_id = sa.spi_project_id
    AND geo.spi_document_reference = dr.document_reference_id;

  `;

  await connection.sql(sql);

  console.log('Successfully transformed study areas');
};
