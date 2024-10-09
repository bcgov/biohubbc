import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformStudyAreas = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Study Area');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Transforms SPI Study Areas into SIMS Survey Locations 
    
    WITH w_survey_points AS (
        SELECT 
            bs.survey_id, 
            sa.study_area_name,
            sa.study_area_description,
            igd.geo,
            ST_ConvexHull(ST_Collect(ST_SetSRID(ST_MakePoint(wso.longitude, wso.latitude), 4326))) AS convex_hull,
            COUNT(wso.wlo_id) AS so_count
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
        AND wso.latitude IS NOT NULL
        GROUP BY bs.survey_id, sa.study_area_name, sa.study_area_description, igd.geo
    ),
    buffered_geographies AS (
        SELECT 
            sp.survey_id,
            sp.study_area_name,
            sp.study_area_description,
            sp.convex_hull,
            sp.geo,
            sp.so_count,
            (0.2 * sqrt(ST_Area(sp.convex_hull)) + 0.05 * pow((ST_Area(sp.convex_hull) / sp.so_count), 0.75)) AS buffer_value -- these constants came from the python tool commissioned by our team from Chartwell project to create spi study areas
        FROM w_survey_points sp
    )
    INSERT INTO biohub.survey_location (survey_id, name, description, geography)
    SELECT 
        bg.survey_id, 
        bg.study_area_name, 
        CASE 
            WHEN bg.geo IS NULL THEN bg.study_area_description || ' - Study Area Created by SPI Code'
            ELSE bg.study_area_description
        END AS study_area_description,
        COALESCE(bg.geo, ST_Buffer(bg.convex_hull, bg.buffer_value)) AS geography
    FROM buffered_geographies bg;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed study areas');
};
