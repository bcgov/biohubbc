import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSurveys = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming surveys');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Creates SIMS surveys from SPI surveys
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.survey (project_id, spi_survey_id, "name", additional_details, start_date, end_date, progress_id, comments)
    SELECT
        p.project_id,
        ss.survey_id,
        ss.survey_name,
        ss.objectives_note || '; ' || ss.survey_type || '; ' || ss.method_type_cd AS additional_details,
        ss.start_date,
        CASE 
            WHEN ss.end_date < ss.start_date THEN ss.start_date
            ELSE ss.end_date
        END AS end_date,
        (SELECT survey_progress_id FROM biohub.survey_progress WHERE name = 'In progress'),
        'Start: ' || ss.start_date || '. End: ' || ss.end_date
    FROM 
        public.spi_surveys ss
    JOIN 
        project p ON ss.spi_project_id = p.spi_project_id
    ON CONFLICT DO NOTHING;


    -------------------------------------------------------------------------------------------------
    -- Inserts survey types for transformed surveys
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.survey_type (survey_id, type_id)
    SELECT
        s.survey_id,
        (SELECT type_id FROM biohub.type WHERE name = 'Species observations')
    FROM
        biohub.survey s
    JOIN 
        public.spi_surveys ss ON ss.survey_id = s.spi_survey_id;


    -------------------------------------------------------------------------------------------------
    -- Inserts focal species for transformed surveys
    -- A separate process is needed to map spi_wldtaxonomic_units_id to ITIS TSNs
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.study_species (survey_id, is_focal, spi_wldtaxonomic_units_id, itis_tsn)
    SELECT 
        s.survey_id, 
        CASE WHEN stt.focus = 'PRIMARY' THEN true ELSE false END AS is_focal, 
        stt.taxonomic_unit_id,
        0
    FROM 
        public.spi_target_taxa stt
    JOIN 
        survey s ON stt.survey_id = s.spi_survey_id;


    -------------------------------------------------------------------------------------------------
    -- Inserts permits for transformed surveys, if the permit value is a number or comma-separated list of numbers
    -------------------------------------------------------------------------------------------------
    WITH w_surveys AS (
        SELECT
            ss.survey_id,
            trim(unnest(string_to_array(ss.wildlife_permit_label, ','))) AS permit_number
        FROM
            public.spi_surveys ss
        INNER JOIN 
            biohub.survey s ON ss.survey_id = s.spi_survey_id
        WHERE
            ss.wildlife_permit_label IS NOT null
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

    
    -------------------------------------------------------------------------------------------------
    -- Inserts intended outcomes (ecological variables) for transformed surveys
    -------------------------------------------------------------------------------------------------
    INSERT INTO biohub.survey_intended_outcome (survey_id, intended_outcome_id)
    SELECT
        s.survey_id,
        (SELECT intended_outcome_id FROM biohub.intended_outcome WHERE name = 'Population size')
    FROM
        biohub.survey s
    JOIN 
        public.spi_surveys ss ON ss.survey_id = s.spi_survey_id
    WHERE 
        s.spi_survey_id IS NOT NULL;


    -------------------------------------------------------------------------------------------------
    -- Inserts survey participants for transformed surveys
    -------------------------------------------------------------------------------------------------


--     
    -- update survey x
    -- set intended_outcome_id = (SELECT io.intended_outcome_id as iq
                            -- FROM biohub.intended_outcome io,
                                    -- biohub.survey s,
                                    -- public.spi_surveys ss
                            -- WHERE s.spi_survey_id is not null
                                -- and ss.survey_id = s.spi_survey_id
                                -- and ss.intended_outcome_measure_code is not null
                                -- and io.name = ss.intended_outcome_measure_code
                                -- and s.survey_id = x.survey_id);
-- 
-- 
    -- update survey x
    -- set ecological_season_id = (SELECT es.ecological_season_id as iq
                                -- FROM biohub.ecological_season es,
                                    -- biohub.survey s,
                                    -- public.spi_surveys ss
                                -- WHERE s.spi_survey_id is not null
                                -- and ss.survey_id = s.spi_survey_id
                                -- and ss.ecological_season_code is not null
                                -- and es.name = ss.ecological_season_code
                                -- and s.survey_id = x.survey_id);
-- 
-- 
    -- INSERT INTO biohub.permit(survey_id, number, type, create_user)
    -- SELECT s.survey_id, ss.wildlife_permit_label, 'spi-imported', 8
    -- FROM biohub.survey s,
        -- public.spi_surveys ss
    -- WHERE spi_survey_id is not null
    -- and ss.survey_id = s.spi_survey_id
    -- and ss.wildlife_permit_label is not null;
-- 
-- 
    -- INSERT INTO biohub.program (name, description)
    -- values ('SPI Imported', '');
-- 
-- 
-- 
    -- INSERT INTO biohub.project_role (name, description, record_effective_date)
    -- values ('SPI Imported Role', '', '1900-01-01');


  `;

  await connection.sql(sql);

  console.log('Successfully transformed surveys');
};
