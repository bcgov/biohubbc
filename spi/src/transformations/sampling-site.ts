import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSampleSites = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Sites');
  const transformSampleSitesSql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Create sampling sites from spi design components
    -- This might have issues with non-null constraints; geojson or geometry might be required in SIMS
    -------------------------------------------------------------------------------------------------
        WITH w_select AS (
                SELECT 
                    sdc.design_component_id,
                    sdc.design_component_label,
                    sdc.note,
                    s.survey_id,
                    sdc.when_created,
                    sdc.when_updated, 
                    sdc.latitude, 
                    sdc.longitude, 
                    igd.geo
                FROM 
                    public.spi_design_components sdc
                JOIN 
                    biohub.project p
                ON
                    p.spi_project_id = sdc.spi_project_id
                JOIN
                    biohub.survey s
                ON
                    p.project_id = s.project_id
                JOIN 
                    public.spi_document_references sdr
                ON 
                    sdr.design_component_id = sdc.design_component_id
                JOIN 
                    public.imported_geo_data igd
                ON 
                    igd.spi_document_reference = sdr.document_reference_id
            ),
            w_inserted AS (
                INSERT INTO biohub.survey_sample_site(name, description, survey_id, create_date, geography, geojson)
                SELECT 
                    ws.design_component_label,
                    ws.note,
                    ws.survey_id,
                    ws.when_created, 
                    COALESCE(ST_SetSRID(ST_MakePoint(ws.longitude, ws.latitude), 4326), ws.geo) AS geography,
                    ST_AsGeoJSON(COALESCE(ST_SetSRID(ST_MakePoint(ws.longitude, ws.latitude), 4326), ws.geo))::jsonb AS geojson
                FROM w_select ws
                RETURNING survey_sample_site_id
            ),
            w_combined AS (
                SELECT wi.survey_sample_site_id, ws.design_component_id
                FROM w_inserted wi
                CROSS JOIN w_select ws
            )
            INSERT INTO public.migrate_spi_sample_design_component (survey_sample_site_id, design_component_id)
            SELECT 
                wc.survey_sample_site_id,
                wc.design_component_id
            FROM w_combined wc;
    -------------------------------------------------------------------------------------------------
    -- Insert SPI Design Component Stratums into SIMS Survey Sample Stratums (the instance of a survey stratum)
    -- These are the actual application of a Survey stratum to a sampling site
    -------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.survey_sample_stratum (survey_sample_site_id, survey_stratum_id)
    SELECT 
        mssdc.survey_sample_site_id,
        (
            SELECT survey_stratum_id 
            FROM biohub.survey_stratum ss 
            JOIN survey s ON s.spi_survey_id = scs.survey_id
            WHERE s.survey_id = scs.survey_id
            AND ss.stratum_name = scs.stratum_name
        )
    FROM 
        public.spi_component_stratums scs
    JOIN 
        public.migrate_spi_sample_design_component mssdc
    ON 
        s.design_component_id = mssdc.design_component_id;
    `;

  await connection.sql(transformSampleSitesSql);

  console.log('Successfully transformed Sampling Sites and stratums');
};
