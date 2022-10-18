import { IDBConnection } from '../database/db';

/**
 * Base class for services that require a database connection.
 *
 * @export
 * @class DBService
 */
export class DBService {
  connection: IDBConnection;

  constructor(connection: IDBConnection) {
    this.connection = connection;
  }
}
