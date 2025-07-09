import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ICollectionLink, IPostCollectionLinkRequest, IPutCollectionLinkRequest } from '../models/collection-link';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

const CollectionLinkRecord = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  collection_id: z.number(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number()
});

/**
 * A repository class for accessing collection link data
 *
 * @export
 * @class CollectionLinkRepository
 * @extends {BaseRepository}
 */
export class CollectionLinkRepository extends BaseRepository {
  /**
   * Get all links for a specific collection.
   *
   * @param {number} collectionId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ICollectionLink[]>}
   * @memberof CollectionLinkRepository
   */
  async getCollectionLinks(collectionId: number, pagination?: ApiPaginationOptions): Promise<ICollectionLink[]> {
    let sqlStatement;

    if (pagination) {
      const limit = pagination.limit;
      const offset = (pagination.page - 1) * pagination.limit;

      sqlStatement = SQL`
        SELECT 
          cl.id,
          cl.name,
          cl.description,
          cl.url,
          cl.collection_id,
          cl.record_end_date,
          cl.create_date,
          cl.create_user
        FROM 
          collection_links cl
        WHERE 
          cl.collection_id = ${collectionId}
          AND cl.record_end_date IS NULL
        ORDER BY cl.create_date DESC
        LIMIT ${limit}
        OFFSET ${offset}`;
    } else {
      sqlStatement = SQL`
        SELECT 
          cl.id,
          cl.name,
          cl.description,
          cl.url,
          cl.collection_id,
          cl.record_end_date,
          cl.create_date,
          cl.create_user
        FROM 
          collection_links cl
        WHERE 
          cl.collection_id = ${collectionId}
          AND cl.record_end_date IS NULL
        ORDER BY cl.create_date DESC`;
    }

    const response = await this.connection.sql(sqlStatement, CollectionLinkRecord);

    if (!response.rows || response.rows.length === 0) {
      return [];
    }

    // Convert string dates to Date objects and map to ICollectionLink
    return response.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      collection_id: row.collection_id,
      record_end_date: row.record_end_date ? new Date(row.record_end_date) : null,
      create_date: new Date(row.create_date),
      create_user: row.create_user
    }));
  }

  /**
   * Get the total count of links for a specific collection.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof CollectionLinkRepository
   */
  async getCollectionLinksCount(collectionId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT 
        COUNT(*)::integer as count
      FROM 
        collection_links cl
      WHERE 
        cl.collection_id = ${collectionId}
        AND cl.record_end_date IS NULL;
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get collection links count', [
        'CollectionLinkRepository->getCollectionLinksCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Create a new collection link.
   *
   * @param {number} collectionId
   * @param {IPostCollectionLinkRequest} linkData
   * @param {number} systemUserId
   * @return {*}  {Promise<ICollectionLink>}
   * @memberof CollectionLinkRepository
   */
  async createCollectionLink(
    collectionId: number,
    linkData: IPostCollectionLinkRequest,
    systemUserId: number
  ): Promise<ICollectionLink> {
    const sqlStatement = SQL`
      INSERT INTO collection_links (
        name,
        description,
        url,
        collection_id,
        create_user
      ) VALUES (
        ${linkData.name},
        ${linkData.description || null},
        ${linkData.url},
        ${collectionId},
        ${systemUserId}
      )
      RETURNING
        id,
        name,
        description,
        url,
        collection_id,
        record_end_date,
        create_date,
        create_user;
    `;

    const response = await this.connection.sql(sqlStatement, CollectionLinkRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to create collection link', [
        'CollectionLinkRepository->createCollectionLink',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    const row = response.rows[0];

    return {
      ...row,
      record_end_date: row.record_end_date ? new Date(row.record_end_date) : null,
      create_date: new Date(row.create_date)
    };
  }

  /**
   * Update an existing collection link.
   *
   * @param {number} collectionId
   * @param {number} linkId
   * @param {IPutCollectionLinkRequest} linkData
   * @return {*}  {Promise<ICollectionLink>}
   * @memberof CollectionLinkRepository
   */
  async updateCollectionLink(
    collectionId: number,
    linkId: number,
    linkData: IPutCollectionLinkRequest
  ): Promise<ICollectionLink> {
    const sqlStatement = SQL`
      UPDATE collection_links 
      SET 
        name = ${linkData.name},
        description = ${linkData.description || null},
        url = ${linkData.url}
      WHERE 
        id = ${linkId}
        AND collection_id = ${collectionId}
        AND record_end_date IS NULL
      RETURNING
        id,
        name,
        description,
        url,
        collection_id,
        record_end_date,
        create_date,
        create_user;
    `;

    const response = await this.connection.sql(sqlStatement, CollectionLinkRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update collection link', [
        'CollectionLinkRepository->updateCollectionLink',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    const row = response.rows[0];

    return {
      ...row,
      record_end_date: row.record_end_date ? new Date(row.record_end_date) : null,
      create_date: new Date(row.create_date)
    };
  }

  /**
   * Delete a collection link by setting record_end_date.
   *
   * @param {number} collectionId
   * @param {number} linkId
   * @return {*}  {Promise<void>}
   * @memberof CollectionLinkRepository
   */
  async deleteCollectionLink(collectionId: number, linkId: number): Promise<void> {
    const sqlStatement = SQL`
      UPDATE collection_links 
      SET 
        record_end_date = NOW()
      WHERE 
        id = ${linkId}
        AND collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete collection link', [
        'CollectionLinkRepository->deleteCollectionLink',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
