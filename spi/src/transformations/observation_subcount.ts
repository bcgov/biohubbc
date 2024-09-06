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
        oss.observation_subcount_sign_id --- this is also placeholder -- will need to build casewhen statements to select the correct oss.name depending on the method_type_Cd in swo
    FROM 
        public.spi_wildlife_observations swo
    JOIN 
        public.migrate_spi_wildlife_observations mwo 
        ON swo.wlo_id = mwo.wlo_id 
    JOIN 
        biohub.observation_subcount_sign oss 
        ON oss.name = 'Direct Sighting'; --- PLACEHOLDER join statement, will be expanded once casewhen for sign types are built above 
  `;

  await connection.sql(transformObservationSubcountsSql);

  console.log('Successfully transformed Observation Subcounts');
};
