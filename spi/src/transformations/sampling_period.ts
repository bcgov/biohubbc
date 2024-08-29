import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSampleVisits = async (connection: IDBConnection): Promise<void> => {
  const transformSampleVisitsSql = SQL`
    set search_path = biohub,public;

------ transforming design component visits into sampling periods --- 


    `;

  await connection.sql(transformSampleVisitsSql);

  console.log('Successfully transformed design component visits');
};
