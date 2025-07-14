import { IDBConnection } from '../database/db';
import { CollectionLink, IPostCollectionLinkRequest, IPutCollectionLinkRequest } from '../models/collection-link';
import { CollectionLinkRepository } from '../repositories/collection-link-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';

/**
 * Service layer for collection links.
 *
 * @export
 * @class CollectionLinkService
 * @extends {DBService}
 */
export class CollectionLinkService extends DBService {
  collectionLinkRepository: CollectionLinkRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionLinkRepository = new CollectionLinkRepository(connection);
  }

  /**
   * Get all links for a specific collection.
   *
   * @param {number} collectionId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<CollectionLink[]>}
   * @memberof CollectionLinkService
   */
  async getCollectionLinks(collectionId: number, pagination?: ApiPaginationOptions): Promise<CollectionLink[]> {
    return this.collectionLinkRepository.getCollectionLinks(collectionId, pagination);
  }

  /**
   * Get the total count of links for a specific collection.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof CollectionLinkService
   */
  async getCollectionLinksCount(collectionId: number): Promise<number> {
    return this.collectionLinkRepository.getCollectionLinksCount(collectionId);
  }

  /**
   * Create a new collection link.
   *
   * @param {number} collectionId
   * @param {IPostCollectionLinkRequest} linkData
   * @return {*}  {Promise<CollectionLink>}
   * @memberof CollectionLinkService
   */
  async createCollectionLink(
    collectionId: number,
    linkData: IPostCollectionLinkRequest
  ): Promise<CollectionLink> {
    return this.collectionLinkRepository.createCollectionLink(collectionId, linkData);
  }

  /**
   * Update an existing collection link.
   *
   * @param {number} collectionId
   * @param {number} linkId
   * @param {IPutCollectionLinkRequest} linkData
   * @return {*}  {Promise<CollectionLink>}
   * @memberof CollectionLinkService
   */
  async updateCollectionLink(
    collectionId: number,
    linkId: number,
    linkData: IPutCollectionLinkRequest
  ): Promise<CollectionLink> {
    return this.collectionLinkRepository.updateCollectionLink(collectionId, linkId, linkData);
  }

  /**
   * Delete a collection link.
   *
   * @param {number} collectionId
   * @param {number} linkId
   * @return {*}  {Promise<void>}
   * @memberof CollectionLinkService
   */
  async deleteCollectionLink(collectionId: number, linkId: number): Promise<void> {
    return this.collectionLinkRepository.deleteCollectionLink(collectionId, linkId);
  }
}
