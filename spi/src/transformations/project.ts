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
        COALESCE(project_objectives, ''), 
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
                b.project_id, 
                CONCAT(pp.first_given_name, ' ', pp.surname) AS full_name,
                spp.email_address
            FROM 
                public.spi_projects p
            INNER JOIN biohub.project b 
                ON p.spi_project_id = b.spi_project_id
            INNER JOIN public.spi_persons pp 
                ON pp.spi_project_id = p.spi_project_id
            LEFT JOIN public.spi_secure_persons spp 
                ON spp.first_name = pp.first_given_name
                AND spp.last_name = pp.surname
        ), 
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
                WHEN TRIM(p.coordinator) LIKE '%' || w_mapping.full_name || '%' AND spp.email_address LIKE '%@gov.bc.ca%' THEN 
                    (SELECT project_role_id FROM biohub.project_role WHERE name = 'Observer')
                WHEN spp.email_address LIKE '%@gov.bc.ca%' THEN 
                    (SELECT project_role_id FROM biohub.project_role WHERE name = 'Observer')
                ELSE 
                    (SELECT project_role_id FROM biohub.project_role WHERE name = 'Observer')
                END AS project_role_id,

                (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user
                
            FROM 
                w_mapping
            JOIN public.spi_projects p 
                ON p.spi_project_id = w_mapping.spi_project_id
            INNER JOIN spi_persons pp 
                ON pp.spi_project_id = p.spi_project_id
            JOIN public.spi_secure_persons spp
                ON spp.first_name = pp.first_given_name
                AND spp.last_name = pp.surname
            RETURNING project_id, system_user_id, project_role_id, create_user
                )

        ------ ensuring that SPI becomes coordinator in cases where no coordinator is assigned ---- 

            INSERT INTO biohub.project_participation
                (project_id, system_user_id, project_role_id, create_user)
            SELECT
                b.project_id,
                (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS system_user_id,
                (SELECT project_role_id FROM biohub.project_role WHERE name = 'Coordinator') AS project_role_id,
                (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user
            FROM 
                biohub.project b
            WHERE NOT EXISTS (
                SELECT 1
                FROM biohub.project_participation pp
                JOIN biohub.project_role pr 
                    ON pp.project_role_id = pr.project_role_id
                WHERE b.project_id = pp.project_id
                AND pr.name = 'Coordinator'
            )
            AND b.spi_project_id IS NOT NULL
        RETURNING project_id, system_user_id, project_role_id, create_user;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed projects');
};


// w_assign_coordinator AS
// (
//         INSERT INTO biohub.project_participation
//         (project_id, system_user_id, project_role_id, create_user)
//     SELECT
//         b.project_id,
//         (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS system_user_id,
//         (SELECT project_role_id FROM biohub.project_role WHERE name = 'Coordinator') AS project_role_id,
//         (SELECT system_user_id FROM biohub.system_user WHERE user_identifier = 'spi') AS create_user
//     FROM 
//         biohub.project b
//     WHERE NOT EXISTS (
//         SELECT 1
//         FROM biohub.project_participation pp
//         JOIN biohub.project_role pr 
//             ON pp.project_role_id = pr.project_role_id
//         WHERE b.project_id = pp.project_id
//         AND pr.name = 'Coordinator'
//     )
//     AND b.spi_project_id IS NOT NULL
// )
// SELECT * FROM w_insert_participation;
// SELECT * FROM w_assign_coordinator;