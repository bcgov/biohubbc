import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const truncateTables = async (connection: IDBConnection): Promise<void> => {
  console.log('Truncating tables');

  const sql = SQL`
  SET SEARCH_PATH=biohub;

  DO $$
  DECLARE
      _project_id integer;
  BEGIN
      FOR _project_id IN
          SELECT project_id
          FROM project
          WHERE spi_project_id IS NOT NULL
      LOOP
          CALL biohub.api_delete_project(_project_id);
      END LOOP;
  END $$;

  TRUNCATE TABLE public.migrate_spi_user_deduplication;

  -- The table must exist first
  TRUNCATE TABLE public.migrate_spi_sample_design_component

  `;

  await connection.sql(sql);

  console.log('Successfully truncated tables');
};
