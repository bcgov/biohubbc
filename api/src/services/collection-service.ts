import { IDBConnection } from '../database/db';
import { SQL, SQLStatement } from 'sql-template-strings';

export class CollectionService {
  /**
   * Fetch all collections.
   *
   * @param {IDBConnection} connection
   * @return {*}  {Promise<any[]>}
   * @memberof CollectionService
   */
  async getAllCollections(connection: IDBConnection): Promise<any[]> {
    const sql: SQLStatement = SQL`
      SELECT
        collection_id,
        name,
        objectives
      FROM
        collection
      WHERE
        record_end_date IS NULL
      ORDER BY
        name ASC;
    `;

    const response = await connection.sql(sql);

    return response.rows;
  }

  /**
   * Create a new collection.
   *
   * @param {IDBConnection} connection
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async createCollection(connection: IDBConnection, collectionData: { name: string; objectives: string }): Promise<any> {
    const sql: SQLStatement = SQL`
      INSERT INTO collection (
        name,
        objectives,
        create_date,
        create_user
      ) VALUES (
        ${collectionData.name},
        ${collectionData.objectives},
        now(),
        1 -- Replace with actual user ID
      )
      RETURNING
        collection_id,
        name,
        objectives;
    `;

    const response = await connection.sql(sql);

    return response.rows[0];
  }

  /**
   * Fetch a collection by ID.
   *
   * @param {IDBConnection} connection
   * @param {number} collectionId
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async getCollectionById(connection: IDBConnection, collectionId: number): Promise<any> {
    const sql: SQLStatement = SQL`
      SELECT
        collection_id,
        name,
        objectives
      FROM
        collection
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await connection.sql(sql);

    return response.rows[0];
  }

  /**
   * Update a collection by ID.
   *
   * @param {IDBConnection} connection
   * @param {number} collectionId
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async updateCollection(
    connection: IDBConnection,
    collectionId: number,
    collectionData: { name?: string; objectives?: string }
  ): Promise<any> {
    const sql: SQLStatement = SQL`
      UPDATE collection
      SET
        name = COALESCE(${collectionData.name}, name),
        objectives = COALESCE(${collectionData.objectives}, objectives),
        update_date = now(),
        update_user = 1 -- Replace with actual user ID
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL
      RETURNING
        collection_id,
        name,
        objectives;
    `;

    const response = await connection.sql(sql);

    return response.rows[0];
  }

  /**
   * Delete a collection by ID.
   *
   * @param {IDBConnection} connection
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionService
   */
  async deleteCollection(connection: IDBConnection, collectionId: number): Promise<boolean> {
    const sql: SQLStatement = SQL`
      UPDATE collection
      SET
        record_end_date = now(),
        update_date = now(),
        update_user = 1 -- Replace with actual user ID
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await connection.sql(sql);

    return response.rowCount !== null && response.rowCount > 0;
  }
}