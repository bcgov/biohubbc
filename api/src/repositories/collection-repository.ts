import { SQL, SQLStatement } from 'sql-template-strings';
import { IDBConnection } from '../database/db';
import { BaseRepository } from './base-repository';
import { FindCollectionsResponse, ICollectionAdvancedFilters } from '../models/collection-view';
import { ApiExecuteSQLError } from '../errors/api-error';

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
   * Returns the total count of collections that are visible to the given user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof CollectionRepository
   */
  async findCollectionsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Promise<number> {
    const sql = SQL`
      SELECT count(*)::integer as count
      FROM collection as c
      WHERE c.record_end_date IS NULL
    `;

    // Add filters manually
    if (!isUserAdmin && systemUserId) {
      sql.append(SQL` AND c.collection_id IN (
        SELECT collection_id FROM collection_system_user WHERE user_id = ${systemUserId}
      )`);
    }

    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      sql.append(SQL` AND (c.name ILIKE ${keywordMatch} OR c.objectives ILIKE ${keywordMatch})`);
    }

    const response = await this.connection.sql(sql);

    if (!response.rows || !response.rows.length) {
      throw new ApiExecuteSQLError('Failed to get collection count', [
        'CollectionRepository->findCollectionsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Retrieves the list of all collections that are available to the user.
   * 
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {ICollectionAdvancedFilters} filterFields
   * @return {*}  {Promise<FindCollectionsResponse[]>}
   * @memberof CollectionRepository
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Promise<FindCollectionsResponse[]> {
    const sql = SQL`
      SELECT
        c.collection_id,
        c.name,
        c.objectives,
        c.revision_count
      FROM collection as c
      WHERE c.record_end_date IS NULL
    `;

    // Add filters manually
    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      sql.append(SQL` AND (c.name ILIKE ${keywordMatch} OR c.objectives ILIKE ${keywordMatch})`);
    }

    if (!isUserAdmin && systemUserId) {
      sql.append(SQL` AND c.collection_id IN (
        SELECT collection_id FROM collection_system_user WHERE user_id = ${systemUserId}
      )`);
    }

    sql.append(SQL` ORDER BY c.name ASC`);

    const response = await this.connection.sql(sql);

    // Process rows and convert to FindCollectionsResponse objects
    const results: FindCollectionsResponse[] = response.rows.map((row) => ({
      collection_id: row.collection_id,
      name: row.name,
      objectives: row.objectives,
      revision_count: row.revision_count,
      members: [] // Members are not included in this simplified query
    }));

    return results;
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
        objectives,
        revision_count
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
   * @param {object} collectionData
   * @param {number} systemUserId 
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async createCollection(
    collectionData: { name: string; objectives: string },
    systemUserId: number
  ): Promise<any> {
    const sql: SQLStatement = SQL`
      INSERT INTO collection (
        name,
        objectives,
        create_user
      ) VALUES (
        ${collectionData.name},
        ${collectionData.objectives},
        ${systemUserId}
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
        objectives,
        revision_count
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
   * Update system alert.
   *
   * @param {} 
   * @return {*} Promise<number>
   * @memberof AlertRepository
   */
  async updateCollection(collection: any, systemUserId: number): Promise<number> {
    const sqlStatement = SQL`
      UPDATE collection
      SET
        name = ${collection.name},
        objectives = ${collection.objectives},
        record_end_date = ${collection.record_end_date},
        update_user = ${systemUserId},
        update_date = now(),
        revision_count = revision_count + 1
      WHERE
        collection_id = ${collection.collection_id}
        AND record_end_date IS NULL
      RETURNING collection_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update collection', [
        'CollectionRepository->updateCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].collection_id;
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionRepository
   */
  async deleteCollection(collectionId: number, systemUserId: number): Promise<boolean> {
    const sql: SQLStatement = SQL`
      UPDATE collection
      SET
        record_end_date = now(),
        update_date = now(),
        update_user = ${systemUserId}
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await this.connection.sql(sql);

    return response.rowCount !== null && response.rowCount > 0;
  }
}
