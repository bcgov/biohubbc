import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const truncateTables = async (connection: IDBConnection): Promise<void> => {
  console.log('Truncating tables');

  const sql = SQL`
    TRUNCATE TABLE public.migrate_spi_user_deduplication
  `;

  await connection.sql(sql);

  console.log('Successfully truncated tables');
};
