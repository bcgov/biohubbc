import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { CollectionLink, IPostCollectionLinkRequest, IPutCollectionLinkRequest } from '../models/collection-link';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

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
   * @return {*}  {Promise<CollectionLink[]>}
   * @memberof CollectionLinkRepository
   */
  async getCollectionLinks(collectionId: number, pagination?: ApiPaginationOptions): Promise<CollectionLink[]> {
    let sqlStatement;

    if (pagination) {
      const limit = pagination.limit;
      const offset = (pagination.page - 1) * pagination.limit;

      sqlStatement = SQL`
        SELECT 
          cl.id as collection_links_id,
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
          cl.id as collection_links_id,
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

    const response = await this.connection.sql(sqlStatement, CollectionLink);
    return response.rows;
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

    return response.rows[0].count;
  }

  /**
   * Create a new collection link.
   *
   * @param {number} collectionId
   * @param {IPostCollectionLinkRequest} linkData
   * @return {*}  {Promise<CollectionLink>}
   * @memberof CollectionLinkRepository
   */
  async createCollectionLink(
    collectionId: number,
    linkData: IPostCollectionLinkRequest
  ): Promise<CollectionLink> {
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
        ${this.connection.systemUserId()}
      )
      RETURNING
        id as collection_links_id,
        name,
        description,
        url,
        collection_id,
        record_end_date,
        create_date,
        create_user;
    `;

    const response = await this.connection.sql(sqlStatement, CollectionLink);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to create collection link', [
        'CollectionLinkRepository->createCollectionLink',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update an existing collection link.
   *
   * @param {number} collectionId
   * @param {number} linkId
   * @param {IPutCollectionLinkRequest} linkData
   * @return {*}  {Promise<CollectionLink>}
   * @memberof CollectionLinkRepository
   */
  async updateCollectionLink(collectionId: number, linkId: number, linkData: IPutCollectionLinkRequest): Promise<CollectionLink> {
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
        id as collection_links_id,
        name,
        description,
        url,
        collection_id,
        record_end_date,
        create_date,
        create_user;
    `;

    const response = await this.connection.sql(sqlStatement, CollectionLink);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update collection link', [
        'CollectionLinkRepository->updateCollectionLink',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
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
