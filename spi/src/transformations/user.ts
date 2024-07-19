import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformUsersSql = SQL`
-------------------------------------------------------------------------------------------------
-- Creates a table in the public schema with unique users
-------------------------------------------------------------------------------------------------
INSERT INTO migrate_spi_user_deduplication(family_name, given_name, display_name, when_created, when_updated, spi_project_ids, spi_person_ids)
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
`

export const transformUsers = async (connection: IDBConnection): Promise<void> => {
  console.log('Transforming users');

  const sql = SQL`
    -------------------------------------------------------------------------------------------------
    -- Creates a table in the public schema with unique users
    -------------------------------------------------------------------------------------------------
    INSERT INTO migrate_spi_user_deduplication(family_name, given_name, display_name, when_created, when_updated, spi_project_ids, spi_person_ids)
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
    INSERT INTO biohub.system_user (
      user_identity_source_id,
      user_identifier,
      record_effective_date,
      create_date,
      create_user,
      update_date,
      display_name,
      given_name,
      family_name,
      notes,
      email
    )
    SELECT 
      (SELECT user_identity_source_id FROM user_identity_source WHERE name = 'UNVERIFIED'),
      'spi-' || id,
      when_created,
      when_created,
      (SELECT system_user_id FROM system_user WHERE user_identifier = 'spi'),
      when_updated,
      display_name,
      given_name,
      family_name,
      'Migrated from SPI as user' || id,
      'default'
    FROM 
      migrate_spi_user_deduplication;

  -------------------------------------------------------------------------------------------------
  -- Update deduplicated users table with the system_user_id
  -------------------------------------------------------------------------------------------------
  UPDATE migrate_spi_user_deduplication AS m
  SET biohub_user_id = su.system_user_id
  FROM biohub.system_user AS su
  WHERE 
    su.user_identifier = 'spi-' || m.id;
  `;

  await connection.sql(sql);

  console.log('Successfully transformed users');
};
