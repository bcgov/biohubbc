import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformWildlifeObservations = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Wildlife Observations');
  const transformWildlifeObservationsSql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Create Wildlife Observations into sims observations table 
    -------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.survey_observation (survey_id, latitude, longitude, count, observation_date, observation_time, create_date, survey_sample_site_id, survey_sample_method_id, survey_sample_period_id, itis_tsn, itis_scientific_name)
    SELECT
        s.survey_id,
        swo.latitude,
        swo.longitude, 
        swo.wlo_count, 
        -- date/time may need to be retrieved from sampling site visit 
        swo.when_created
        -- join tables for ids for period, method, site
        -- need to drop the not null constraint for itis tsn, then need to insert the swo.taxonimic_unit_id into biohub.study_species.spi_wldtaxonomic_units_id
    FROM 
        public.spi_wildlife_observations swo
    JOIN 
        biohub.survey s
    ON 
        s.spi_survey_id = swo.survey_id;
  `;

  await connection.sql(transformWildlifeObservationsSql);

  console.log('Successfully transformed Wildlife Observations');
};
