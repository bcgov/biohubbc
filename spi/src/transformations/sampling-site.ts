import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSampleSites = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Sites');
  const transformSampleSitesSql = SQL`
    set search_path = biohub,public;

    ----------------------------------------------------------------
    -- Create sampling sites from spi design components
    -- This might have issues with non-null constraints; geojson or geometry might be required in SIMS
    -------------------------------------------------------------------------------------------------
    WITH w_inserted AS (
        INSERT INTO 
            biohub.survey_sample_site(name, description, survey_id, create_date, update_date)
        SELECT 
            sdc.design_component_label,
            sdc.note,
            s.survey_id,
            sdc.when_created,
            sdc.when_updated
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
        RETURNING *
        )
    INSERT INTO 
        public.migrate_spi_sample_design_component (survey_sample_site_id, design_component_id)
    SELECT 
      survey_sample_site_id,
      design_component_id
    FROM 
        w_inserted wi;

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

  console.log('Successfully transformed stratums');
};
