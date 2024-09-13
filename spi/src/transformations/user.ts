import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformUsers = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming users');

  const sql = SQL`
    set search_path = biohub,public;

    -------------------------------------------------------------------------------------------------
    -- Creates a table in the public schema with unique users
    -------------------------------------------------------------------------------------------------
    INSERT INTO public.migrate_spi_user_deduplication(family_name, given_name, display_name, when_created, when_updated, spi_project_ids, spi_person_ids)
    SELECT 
      surname,
      regexp_replace(concat(trim(first_given_name), ' ', trim(second_given_name)), '\s+', ' ', 'g') as given_name,
      regexp_replace(concat(trim(first_given_name), ' ', trim(second_given_name), ' ', trim(surname)), '\s+', ' ', 'g') as display_name,
      min(date_trunc('day', when_created)) as when_created,
      max(date_trunc('day', when_updated)) as when_updated,
      array_agg(spi_project_id) as spi_project_ids,
      array_agg(person_id) as spi_person_ids
    FROM spi_persons
    GROUP BY 
      surname, 
      regexp_replace(concat(trim(first_given_name), ' ', trim(second_given_name)), '\s+', ' ', 'g'),
      regexp_replace(concat(trim(first_given_name), ' ', trim(second_given_name), ' ', trim(surname)), '\s+', ' ', 'g');

      
    -------------------------------------------------------------------------------------------------
    -- Turn deduplicated users into SIMS users
    -------------------------------------------------------------------------------------------------
    CREATE TEMP TABLE temp_existing_users AS
    SELECT 
        system_user_id,
        family_name,
        given_name
    FROM biohub.system_user;
    )
    INSERT INTO biohub.system_user (
        user_identity_source_id,
        user_identifier,
        record_effective_date,
        display_name,
        given_name,
        family_name,
        notes,
        email
    )
    SELECT 
        (SELECT user_identity_source_id FROM biohub.user_identity_source WHERE name = 'UNVERIFIED'),
        'spi-' || md.id,
        now(),
        md.display_name,
        md.given_name,
        md.family_name,
        'Migrated from SPI as user ' || md.id,
        COALESCE(spp.email_address, 'default') AS email
    FROM 
        migrate_spi_user_deduplication md
    LEFT JOIN 
        public.spi_secure_persons spp ON spp.first_name = md.given_name AND spp.last_name = md.family_name
    LEFT JOIN 
        temp_existing_users eu ON eu.given_name = md.given_name AND eu.family_name = md.family_name
    WHERE eu.system_user_id IS NULL;

    ------------------------------------------------------------------------------------------------
    -- Update deduplicated users table with the system_user_id
    ------------------------------------------------------------------------------------------------
    UPDATE migrate_spi_user_deduplication AS m
    SET biohub_user_id = su.system_user_id
    FROM biohub.system_user AS su
    WHERE su.user_identifier = 'spi-' || m.id;

    -- For existing users
    UPDATE migrate_spi_user_deduplication AS m
    SET biohub_user_id = eu.system_user_id
    FROM temp_existing_users eu
    WHERE eu.given_name = m.given_name
    AND eu.family_name = m.family_name;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed users');
};
