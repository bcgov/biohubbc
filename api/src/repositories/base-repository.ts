import { IDBConnection } from '../database/db';

/**
 * Base class for repositories.
 *
 * @export
 * @class BaseRepository
 */
export class BaseRepository {
  connection: IDBConnection;

  constructor(connection: IDBConnection) {
    this.connection = connection;
  }
}
