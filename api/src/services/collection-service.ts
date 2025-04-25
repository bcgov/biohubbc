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
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async createCollection(collectionData: { name: string; objectives: string }): Promise<any> {
    // Here you could add business logic if needed
    // For example, validation, permission checks, etc.
    
    return this.collectionRepository.createCollection(collectionData);
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
   * Update a collection by ID.
   *
   * @param {number} collectionId
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionService
   */
  async updateCollection(
    collectionId: number,
    collectionData: { name?: string; objectives?: string }
  ): Promise<any> {
    // Business logic could be added here
    // For example, checking if the user has permission to update
    
    return this.collectionRepository.updateCollection(collectionId, collectionData);
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionService
   */
  async deleteCollection(collectionId: number): Promise<boolean> {
    // Example of business logic in the service layer:
    // Check if there are any dependent records that need to be deleted first
    
    // This is where you would handle the scenario you mentioned:
    // "if a database record is being deleted, the service will ensure any dependent database records are deleted first"
    
    // For example (pseudocode):
    // const dependentRecords = await this.someRepository.getDependentRecords(collectionId);
    // if (dependentRecords.length > 0) {
    //   await this.someRepository.deleteDependentRecords(dependentRecords);
    // }
    
    return this.collectionRepository.deleteCollection(collectionId);
  }
}