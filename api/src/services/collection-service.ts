import { IDBConnection } from '../database/db';
import { Collection, ICollectionAdvancedFilters, IPostCollection } from '../models/collection';
import { CollectionRepository } from '../repositories/collection-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { DBService } from './db-service';

/**
 * Service layer for collections.
 *
 * @export
 * @class CollectionService
 * @extends {DBService}
 */
export class CollectionService extends DBService {
  collectionRepository: CollectionRepository;
  attractantService: AttractantService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionRepository = new CollectionRepository(connection);
    this.attractantService = new AttractantService(connection);
  }

  /**
   * Get a collection by id.
   *
   * @param {number} methodCollectionId
   * @return {*}  {Promise<Collection>}
   * @memberof CollectionService
   */
  async getCollectionById(methodCollectionId: number): Promise<Collection> {
    return this.collectionRepository.getCollectionById(methodCollectionId);
  }

  /**
   * Retrieves the paginated list of all collections that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<Collection[]>}
   * @memberof CollectionService
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Collection[]> {
    return this.collectionRepository.findCollections(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all collections that are available to the user, based on their permissions and
   * provided filter criteria.
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
   * Create a collection record.
   *
   * @param {IPostCollection} collection
   * @return {*}  {Promise<void>}
   * @memberof CollectionService
   */
  async createCollection(collection: IPostCollection): Promise<void> {
    return this.collectionRepository.createCollection(collection);
  }

  /**
   * Update a collection record.
   *
   * @param {number} collectionId
   * @param {IPostCollection} collection
   * @return {*}  {Promise<void>}
   * @memberof CollectionService
   */
  async updateCollection(collectionId: number, collection: IPostCollection): Promise<void> {
    return this.collectionRepository.updateCollection(collectionId, collection);
  }
}
