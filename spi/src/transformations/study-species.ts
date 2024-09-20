import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformStudySpecies = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming study species');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Creates SIMS study species from SPI target taxa 
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.study_species (survey_id, is_focal, create_date, create_user, itis_tsn, spi_wldtaxonomic_units_id, is_spi_import)
    SELECT
        bs.survey_id,
        CASE 
            WHEN stt.focus = 'PRIMARY' THEN TRUE
            ELSE FALSE
        END AS is_focal, 
        stt.when_created,
        (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user, 
        CAST(mss.itis_tsn AS INTEGER) AS itis_tsn, 
        stt.taxonomic_unit_id,
        TRUE as is_spi_import
    FROM public.spi_target_taxa stt
    JOIN biohub.survey bs
        ON stt.survey_id = bs.spi_survey_id
    JOIN public.migrate_spi_species mss
        ON mss.spi_species_id = stt.taxonomic_unit_id
    WHERE mss.itis_tsn IS NOT NULL;


  `;

  await connection.sql(sql);

  console.log('Successfully transformed study species');
};
