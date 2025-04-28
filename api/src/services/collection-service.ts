import { CollectionModel } from '../database-models/collection';
import { IDBConnection } from '../database/db';
import { Collection, ICollectionAdvancedFilters, IPostCollectionRequest } from '../models/collection';
import { CollectionRepository } from '../repositories/collection-repository';
import {
  AllObservationSupplementaryData,
  ObservationRecordWithSamplingAndSubcountData
} from '../repositories/observation-repository/observation-repository.interface';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { CollectionMemberService } from './collection-participation-service';
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
   * @return {*}  {Promise<CollectionModel>}
   * @memberof CollectionService
   */
  async createCollection(collection: IPostCollectionRequest): Promise<CollectionModel> {
    const collectionResponse = await this.collectionRepository.createCollection(collection);

    // Insert members of the collection
    await this.collectionMemberService.insertCollectionParticipants(
      collectionResponse.collection_id,
      collection.participants
    );

    return collectionResponse;
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

    // Get current participants from DB
    const currentParticipants = await this.collectionMemberService.getCollectionParticipants(collectionId);

    // Find new participants to insert
    const newParticipants = collection.participants.filter(
      (member) => !currentParticipants.some((existing) => existing.system_user_id === member.system_user_id)
    );

    // Find participants to remove
    const incomingIds = collection.participants.map((m) => m.system_user_id);
    const oldParticipants = currentParticipants.filter((existing) => !incomingIds.includes(existing.system_user_id));

    // Find participants whose role has changed
    const modifiedParticipants = currentParticipants
      .map((existing) => {
        const incoming = collection.participants.find((p) => p.system_user_id === existing.system_user_id);

        if (incoming && existing.collection_role_name !== incoming.collection_role_name) {
          return {
            ...existing,
            newRole: incoming.collection_role_name
          };
        }

        return null;
      })
      .filter((p) => p !== null) as Array<(typeof currentParticipants)[0] & { newRole: string }>;

    // Insert new participants
    await this.collectionMemberService.insertCollectionParticipants(collectionId, newParticipants);

    // Remove old participants
    for (const participant of oldParticipants) {
      await this.collectionMemberService.deleteCollectionMemberRecord(collectionId, participant.collection_member_id);
    }

    // Update roles of modified participants
    for (const participant of modifiedParticipants) {
      await this.collectionMemberService.updateCollectionParticipantRole(
        collectionId,
        participant.collection_member_id,
        participant.newRole
      );
    }

    return collectionResponse;
  }
}
