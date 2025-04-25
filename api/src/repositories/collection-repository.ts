import { SQL, SQLStatement } from 'sql-template-strings';
import { IDBConnection } from '../database/db';
import { BaseRepository } from './base-repository';

/**
 * Repository for collection database operations.
 *
 * @export
 * @class CollectionRepository
 * @extends {BaseRepository}
 */
export class CollectionRepository extends BaseRepository {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  /**
   * Fetch all collections.
   *
   * @return {*}  {Promise<any[]>}
   * @memberof CollectionRepository
   */
  async getAllCollections(): Promise<any[]> {
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

    const response = await this.connection.sql(sql);

    return response.rows;
  }

  /**
   * Create a new collection.
   *
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async createCollection(collectionData: { name: string; objectives: string }): Promise<any> {
    const sql: SQLStatement = SQL`
      INSERT INTO collection (
        name,
        objectives,
        create_date,
        create_user
      ) VALUES (
        ${collectionData.name},
        ${collectionData.objectives},
        now()
      )
      RETURNING
        collection_id,
        name,
        objectives;
    `;

    const response = await this.connection.sql(sql);

    return response.rows[0];
  }

  /**
   * Fetch a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async getCollectionById(collectionId: number): Promise<any> {
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

    const response = await this.connection.sql(sql);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0];
  }

  /**
   * Update a collection by ID.
   *
   * @param {number} collectionId
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async updateCollection(
    collectionId: number,
    collectionData: { name?: string; objectives?: string }
  ): Promise<any> {
    // Start building the SQL query
    let sql = SQL`
      UPDATE collection
      SET
        update_date = now(),
        update_user = 1 -- Replace with actual user ID
    `;

    // Add optional fields to update
    if (collectionData.name !== undefined) {
      sql = sql.append(SQL`, name = ${collectionData.name}`);
    }

    if (collectionData.objectives !== undefined) {
      sql = sql.append(SQL`, objectives = ${collectionData.objectives}`);
    }

    // Complete the query
    sql = sql.append(SQL`
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL
      RETURNING
        collection_id,
        name,
        objectives;
    `);

    const response = await this.connection.sql(sql);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0];
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionRepository
   */
  async deleteCollection(collectionId: number): Promise<boolean> {
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

    const response = await this.connection.sql(sql);

    return response.rowCount !== null && response.rowCount > 0;
  }
}