import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSurveys = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming surveys');

  const sql = SQL`
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
        (SELECT survey_progress_id FROM survey_progress WHERE name = 'In progress'),
        'Start: ' || ss.start_date || '. End: ' || ss.end_date
    FROM 
        public.spi_surveys ss
    JOIN 
        project p ON ss.spi_project_id = p.spi_project_id
    ON CONFLICT DO NOTHING;


    -------------------------------------------------------------------------------------------------
    -- Inserts survey types for transformed surveys
    -------------------------------------------------------------------------------------------------
    INSERT INTO survey_type (survey_id, type_id)
    SELECT
        s.survey_id,
        CASE
            WHEN ss.survey_type IN (
                'Noninvasive Technique', 'Track Count', 'Aerial Survey', 'DNA-Env', 'Ground Count', 'MRR', 
                'DNA-Ind', 'Census', 'Mortality', 'Call Playback', 'Incidentals', 'Telemetry', 'CaPl', 
                'WiCa', 'Reconnaissance', 'Composition', 'Recruitment', 'DC', 'MRR-DNA-Ind', 'TrCo', 
                'SpCo', 'Pellet/Scat Count'
            ) THEN (SELECT type_id FROM type WHERE name = 'Monitoring')
            ELSE (SELECT type_id FROM type WHERE name = 'Monitoring')
        END AS type_id
    FROM
        survey s
    JOIN 
        public.spi_surveys ss ON ss.survey_id = s.spi_survey_id;


    -------------------------------------------------------------------------------------------------
    -- Inserts focal species for transformed surveys
    -- A separate process is needed to map spi_wldtaxonomic_units_id to ITIS TSNs
    -------------------------------------------------------------------------------------------------
    INSERT INTO study_species (survey_id, is_focal, spi_wldtaxonomic_units_id, itis_tsn)
    SELECT 
        s.survey_id, 
        CASE WHEN stt.focus = 'PRIMARY' THEN true ELSE false END AS is_focal, 
        stt.taxonomic_unit_id,
        0
    FROM 
        spi_target_taxa stt
    JOIN 
        survey s ON stt.survey_id = s.spi_survey_id;


    -------------------------------------------------------------------------------------------------
    -- Inserts permits for transformed surveys
    -------------------------------------------------------------------------------------------------
    WITH surveys AS (
        SELECT
            s.survey_id,
            unnest(string_to_array(ss.wildlife_permit_label, ', ')) AS permit_number
        FROM
            public.spi_surveys ss
        JOIN 
            survey s ON ss.survey_id = s.spi_survey_id
        WHERE
            ss.wildlife_permit_label IS NOT NULL
        )
    INSERT INTO permit (survey_id, number, type)
    SELECT DISTINCT
        survey_id,
        permit_number,
        'Wildlife Permit - General'
    FROM surveys;

    
    -------------------------------------------------------------------------------------------------
    -- Inserts intended outcomes (ecological variables) for transformed surveys
    -------------------------------------------------------------------------------------------------
    INSERT INTO survey_intended_outcome (survey_id, intended_outcome_id)
    SELECT
        s.survey_id,
        CASE
            WHEN ss.intended_outcome_measure_code IN (
                'PopCnt', 'PopCnt-Comp', 'PopComp', 'DRM', 'PopIn', 'Mort', 'PComp', 'PoCo-PComp', 
                'Trans', 'PopCnt-Recr', 'Reco', 'CComp', 'SpCol', 'HaAs', 'Surv', 'Recr'
            ) THEN (SELECT intended_outcome_id FROM intended_outcome WHERE name = 'Mortality')
            ELSE (SELECT intended_outcome_id FROM intended_outcome WHERE name = 'Mortality')
        END AS intended_outcome_id
    FROM
        survey s
    JOIN 
        public.spi_surveys ss ON ss.survey_id = s.spi_survey_id
    WHERE 
        ss.spi_survey_id IS NOT NULL;


    -------------------------------------------------------------------------------------------------
    -- Inserts survey participants for transformed surveys
    -------------------------------------------------------------------------------------------------


--     
    -- update survey x
    -- set intended_outcome_id = (SELECT io.intended_outcome_id as iq
                            -- FROM intended_outcome io,
                                    -- survey s,
                                    -- spi_surveys ss
                            -- WHERE s.spi_survey_id is not null
                                -- and ss.survey_id = s.spi_survey_id
                                -- and ss.intended_outcome_measure_code is not null
                                -- and io.name = ss.intended_outcome_measure_code
                                -- and s.survey_id = x.survey_id);
-- 
-- 
    -- update survey x
    -- set ecological_season_id = (SELECT es.ecological_season_id as iq
                                -- FROM ecological_season es,
                                    -- survey s,
                                    -- spi_surveys ss
                                -- WHERE s.spi_survey_id is not null
                                -- and ss.survey_id = s.spi_survey_id
                                -- and ss.ecological_season_code is not null
                                -- and es.name = ss.ecological_season_code
                                -- and s.survey_id = x.survey_id);
-- 
-- 
    -- INSERT INTO permit(survey_id, number, type, create_user)
    -- SELECT s.survey_id, ss.wildlife_permit_label, 'spi-imported', 8
    -- FROM survey s,
        -- spi_surveys ss
    -- WHERE spi_survey_id is not null
    -- and ss.survey_id = s.spi_survey_id
    -- and ss.wildlife_permit_label is not null;
-- 
-- 
    -- INSERT INTO program (name, description)
    -- values ('SPI Imported', '');
-- 
-- 
-- 
    -- INSERT INTO project_role (name, description, record_effective_date)
    -- values ('SPI Imported Role', '', '1900-01-01');


  `;

  await connection.sql(sql);

  console.log('Successfully transformed surveys');
};
