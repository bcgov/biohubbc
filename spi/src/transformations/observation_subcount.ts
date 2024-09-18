import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformWildlifeObservations = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming Observation Subcounts');
  const transformObservationSubcountsSql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Create observation subcounts in biohub.observation_subcount
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.observation_subcount (survey_observation_id, subcount, create_date, observation_subcount_sign_id)
    SELECT
        mwo.survey_observation_id,
        swo.subcount, ----- this is PLACEHOLDER - we will need to tease the subcounts out of those a-series columns depending on the method_type_cd and version
        swo.when_created,
        CASE
            WHEN swo.method_type_cd = 'Animal DNA Collecting' THEN (
                SELECT oss.observation_subcount_sign_id 
                FROM biohub.observation_subcount_sign oss 
                WHERE oss.name = 'DNA'
            )
            WHEN swo.method_type_cd IN ('Bat Acoustic', 'OBS_BAPT_AUDI_2.0') THEN (
                SELECT oss.observation_subcount_sign_id 
                FROM biohub.observation_subcount_sign oss 
                WHERE oss.name = 'Sound'
            )
            WHEN swo.method_type_cd IN ('OBS_BEAR_SIGN_2.0') THEN (
                SELECT oss.observation_subcount_sign_id 
                FROM biohub.observation_subcount_sign oss 
                WHERE oss.name = 'Rub or scratch spot'
            )
            ELSE (
                SELECT oss.observation_subcount_sign_id 
                FROM biohub.observation_subcount_sign oss 
                WHERE oss.name = 'Direct Sighting'
            )
        END AS observation_subcount_sign_id
    
    FROM 
        public.spi_wildlife_observations swo
    JOIN 
        public.migrate_spi_wildlife_observations mwo 
        ON swo.wlo_id = mwo.wlo_id; 
  `;

  await connection.sql(transformObservationSubcountsSql);

  console.log('Successfully transformed Observation Subcounts');
};
