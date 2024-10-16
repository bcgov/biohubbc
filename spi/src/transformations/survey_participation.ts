import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSurveyParticipants = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming survey participants');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Creates SIMS survey participation roles from spi survey surveyors table 
    -------------------------------------------------------------------------------------------------
    
    ----- delete this insert statement after testing 
    INSERT INTO biohub.survey_job (name, description, record_effective_date)
    VALUES 
        ('Crew member', 'A paricipant of a survey in a crew member role', NOW()), 
        ('Crew lead', 'A paricipant of a survey in a crew lead role', NOW());
------- delete above
    
    INSERT INTO biohub.survey_participation (survey_id, system_user_id, survey_job_id, create_date, create_user)
    SELECT 
        s.survey_id, 
        msud.biohub_user_id,
        CASE 
            WHEN sss.role_type IN ('SURVEYOR','Y') THEN 
                (SELECT survey_job_id FROM biohub.survey_job WHERE survey_job.name = 'Crew member')
            WHEN sss.role_type IN ('LEADER', 'COORDINATOR', 'NAVIGATOR') THEN 
                (SELECT survey_job_id FROM biohub.survey_job WHERE survey_job.name = 'Crew lead')
            WHEN sss.role_type = 'PILOT' THEN 
                (SELECT survey_job_id FROM biohub.survey_job WHERE survey_job.name = 'Pilot')  
        END AS survey_job_id,
        sss.when_created,
        (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user
    FROM public.spi_survey_surveyors sss
    JOIN biohub.survey s
    ON sss.survey_id = s.spi_survey_id
    JOIN public.migrate_spi_user_deduplication msud
    ON sss.person_id = ANY (msud.spi_person_ids)
    WHERE sss.role_type IS NULL OR sss.role_type != 'N';
  `;

  await connection.sql(sql);

  console.log('Successfully transformed survey participants');
};
