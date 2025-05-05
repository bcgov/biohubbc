import { IDBConnection } from '../database/db';
import { DBService } from './db-service';
import { CollectionRepository } from '../repositories/collection-repository';
import { FindCollectionsResponse, ICollectionAdvancedFilters } from '../models/collection-view';

/**
 * Service for collection operations.
 * Handles business logic and orchestrates repository calls.
 *
 * @export
 * @class CollectionService
 * @extends {DBService}
 */
export class CollectionService extends DBService {
  private collectionRepository: CollectionRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.collectionRepository = new CollectionRepository(connection);
  }

  /**
   * Retrieves the paginated list of all collections that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {(Promise<(FindCollectionsResponse)[]>)}
   * @memberof CollectionService
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
  ): Promise<FindCollectionsResponse[]> {
    const response = await this.collectionRepository.findCollections(isUserAdmin, systemUserId, filterFields);
    return response;
  }

  /**
   * Retrieves the count of all collections that are available to the user, based on their permissions and provided
   * filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof CollectionService
   */
  async findCollectionsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Promise<number> {
    return this.collectionRepository.findCollectionsCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Get all collections.
   *
   * @return {*}  {Promise<any[]>}
   * @memberof CollectionService
   */
  async getAllCollections(): Promise<any[]> {
    return this.collectionRepository.getAllCollections();
  }

  /**
   * Create a new collection.
   *
   * @param {*} collectionData
   * @param {number} systemUserId The system user id to use for owner and create_user
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async createCollection(collectionData: { name: string; objectives: string }, systemUserId: number): Promise<any> {
    // Here you could add business logic if needed
    // For example, validation, permission checks, etc.
    return this.collectionRepository.createCollection(collectionData, systemUserId);
  }

  /**
   * Get a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async getCollectionById(collectionId: number): Promise<any> {
    return this.collectionRepository.getCollectionById(collectionId);
  }

  /**
   * Update a system alert.
   *
   * @param {*} collectionData
   * @param {number} systemUserId The system user id of the user making the request
   * @return {*}  Promise<any>
   * @memberof CollectionService
   */
  async updateCollection(collection: any, systemUserId: number): Promise<number> {
    return this.collectionRepository.updateCollection(collection, systemUserId);
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionService
   */
  async deleteCollection(collectionId: number): Promise<boolean> {

    
    return this.collectionRepository.deleteCollection(collectionId);
  }
}