import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformProjects = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming projects');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Transforms SPI projects into SIMS projects
    -------------------------------------------------------------------------------------------------
    INSERT INTO 
        biohub.project (spi_project_id, name, objectives, location_description, create_date)
    SELECT 
        spi_project_id,
        project_name,
        COALESCE(project_objectives, ''),  -- Null values will be changed to an empty string
        location_description,
        when_created
    FROM 
        public.spi_projects;

    -------------------------------------------------------------------------------------------------
    -- Determines project associations of each user and inserts associations into project_participation
    -------------------------------------------------------------------------------------------------
    WITH w_mapping AS
        (
            SELECT 
                p.spi_project_id, 
                pp.person_id, 
                b.project_id
            FROM 
                public.spi_projects p
            INNER JOIN 
                biohub.project b ON p.spi_project_id = b.spi_project_id
            INNER JOIN 
                spi_persons pp ON pp.spi_project_id = p.spi_project_id
        )
    INSERT INTO
        biohub.project_participation (project_id, system_user_id, project_role_id, create_user)
    SELECT DISTINCT
        w_mapping.project_id,

        COALESCE (
        (SELECT biohub_user_id 
         FROM public.migrate_spi_user_deduplication 
         WHERE w_mapping.person_id = ANY (spi_person_ids)
        ), 
        (SELECT system_user_id 
         FROM biohub.system_user 
         WHERE user_identifier = 'spi')
        ) AS system_user_id,

            CASE 
        WHEN spp.email_address LIKE '%@gov.bc.ca%' THEN 
            (SELECT project_role_id FROM biohub.project_role WHERE name = 'Collaborator')
        ELSE 
            (SELECT project_role_id FROM biohub.project_role WHERE name = 'Observer')
        END AS project_role_id,

        (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user
        
    FROM 
        w_mapping
    JOIN 
        public.spi_secure_persons spp
        ON spp.first_name = pp.first_given_name
        AND spp.last_name = pp.surname;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed projects');
};