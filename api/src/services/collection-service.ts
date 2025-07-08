import { CollectionModel } from '../database-models/collection';
import { IDBConnection } from '../database/db';
import { HTTP401 } from '../errors/http-error';
import { Collection, ICollectionAdvancedFilters, IPostCollectionRequest } from '../models/collection';
import { CollectionRepository } from '../repositories/collection-repository';
import {
  AllObservationSupplementaryData,
  ObservationRecordWithSamplingAndSubcountData
} from '../repositories/observation-repository/observation-repository.interface';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { CollectionMemberService } from './collection-member-service';
import { CollectionSurveyService } from './collection-survey-service';
import { DBService } from './db-service';
import { ObservationService } from './observation-services/observation-service';

/**
 * Service layer for collections.
 *
 * @export
 * @class CollectionService
 * @extends {DBService}
 */
export class CollectionService extends DBService {
  collectionRepository: CollectionRepository;
  collectionMemberService: CollectionMemberService;
  collectionSurveyService: CollectionSurveyService;
  attractantService: AttractantService;
  observationService: ObservationService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionRepository = new CollectionRepository(connection);
    this.collectionMemberService = new CollectionMemberService(connection);
    this.attractantService = new AttractantService(connection);
    this.collectionSurveyService = new CollectionSurveyService(connection);
    this.observationService = new ObservationService(connection);
  }

  /**
   * Get a collection by id.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<Collection>}
   * @memberof CollectionService
   */
  async getCollectionById(collectionId: number): Promise<Collection> {
    return this.collectionRepository.getCollectionById(collectionId);
  }

  /**
   * Get the parents of the given collectionId
   *
   * @param {number} collectionId
   * @return {*}  {Promise<Collection>}
   * @memberof CollectionService
   */
  async getCollectionParentsById(collectionId: number): Promise<Collection> {
    const collections = this.collectionRepository.getCollectionParentsById(collectionId);

    // TODO: Filter collections that the user does not have access to
    const filteredCollections = collections;

    return filteredCollections;
  }

  /**
   *
   */
  async getCollectionObservations(
    collectionId: number,
    pagination?: ApiPaginationOptions
  ): Promise<{
    surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
    supplementaryObservationData: AllObservationSupplementaryData;
  }> {
    // Find surveys in collection
    const surveys = await this.collectionSurveyService.getSurveysInCollection(collectionId);

    // Find observations in the surveys
    const observationData =
      await this.observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
        surveys.map((survey) => survey.survey_id),
        pagination
      );

    return observationData;
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
   * @param {IPostCollectionRequest} collection
   * @param {number} systemUserId
   * @return {*}  {Promise<CollectionModel>}
   * @memberof CollectionService
   */
  async createCollection(collection: IPostCollectionRequest, systemUserId?: number): Promise<CollectionModel> {
    // Confirm that the user has access to the parent collection id
    if (collection.parent_collection_id && systemUserId) {
      const member = await this.collectionMemberService.getCollectionMemberByCollectionIdAndSystemUserId(
        collection.parent_collection_id,
        systemUserId
      );

      if (!member) {
        throw new HTTP401('Access denied: No access to the parent collection');
      }
    }

    const collectionResponse = await this.collectionRepository.createCollection(collection);

    // Insert members of the collection
    await this.collectionMemberService.insertCollectionMembers(collectionResponse.collection_id, collection.members);

    return collectionResponse;
  }

  /**
   * Get collections that the given survey belongs to
   *
   * @param {number} surveyId
   * @returns {Promise<Collection[]>}
   */
  async getCollectionsBySurveyId(surveyId: number): Promise<Collection[]> {
    return this.collectionRepository.getCollectionsBySurveyId(surveyId);
  }

  /**
   * Update a collection record.
   *
   * @param {number[]} collectionIds
   * @return {*}  {Promise<void>}
   * @memberof CollectionService
   */
  async deleteCollectionParents(collectionIds: number[]): Promise<void> {
    // Update the collection record
    await this.collectionRepository.deleteCollectionParents(collectionIds);
  }

  /**
   * Update a collection record.
   *
   * @param {number} collectionId
   * @param {IPostCollectionRequest} collection
   * @return {*}  {Promise<CollectionModel>}
   * @memberof CollectionService
   */
  async updateCollection(collectionId: number, collection: IPostCollectionRequest): Promise<CollectionModel> {
    // Update the collection record
    const collectionResponse = await this.collectionRepository.updateCollection(collectionId, collection);

    // Get current members from DB
    const currentMembers = await this.collectionMemberService.getCollectionMembers(collectionId);

    // Find new members to insert
    const newMembers = collection.members.filter(
      (member) => !currentMembers.some((existing) => existing.system_user_id === member.system_user_id)
    );

    // Find members to remove
    const incomingIds = collection.members.map((m) => m.system_user_id);
    const oldMembers = currentMembers.filter((existing) => !incomingIds.includes(existing.system_user_id));

    // Find members whose role has changed
    const modifiedMembers = currentMembers
      .map((existing) => {
        const incoming = collection.members.find((p) => p.system_user_id === existing.system_user_id);

        if (incoming && existing.collection_role_name !== incoming.collection_role_name) {
          return {
            ...existing,
            newRole: incoming.collection_role_name
          };
        }

        return null;
      })
      .filter((p) => p !== null) as Array<(typeof currentMembers)[0] & { newRole: string }>;

    // Insert new members
    await this.collectionMemberService.insertCollectionMembers(collectionId, newMembers);

    // Remove old members
    for (const member of oldMembers) {
      await this.collectionMemberService.deleteCollectionMemberRecord(collectionId, member.collection_member_id);
    }

    // Update roles of modified members
    for (const member of modifiedMembers) {
      await this.collectionMemberService.updateCollectionMemberRole(
        collectionId,
        member.collection_member_id,
        member.newRole
      );
    }

    return collectionResponse;
  }

  /**
   * Get all subcollection Ids (all depths) for the given collection id
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number[]>}
   * @memberof CollectionService
   */
  async getSubcollectionIds(collectionId: number): Promise<number[]> {
    return this.collectionRepository.getSubcollectionIds(collectionId);
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<void>}
   * @memberof CollectionService
   */
  async deleteCollection(collectionId: number): Promise<void> {
    // Get the Ids of all subcollections (flattened hierarchy) for the to-be-deleted collection
    const subcollectionIds = await this.getSubcollectionIds(collectionId);

    // Delete the subcollections (internally removes foreign key-linked records, i.e members, surveys)
    await this.collectionRepository.deleteCollections([...subcollectionIds, collectionId]);
  }
}
