import { CollectionModel } from '../database-models/collection';
import { IDBConnection } from '../database/db';
import {
  Collection,
  CollectionParticipant,
  ICollectionAdvancedFilters,
  IPostCollection,
  IPostCollectionRequest
} from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { CollectionRepository } from '../repositories/collection-repository';
import {
  AllObservationSupplementaryData,
  ObservationRecordWithSamplingAndSubcountData
} from '../repositories/observation-repository/observation-repository.interface';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { CollectionParticipationService } from './collection-participation-service';
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
  collectionParticipationService: CollectionParticipationService;
  collectionSurveyService: CollectionSurveyService;
  attractantService: AttractantService;
  observationService: ObservationService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionRepository = new CollectionRepository(connection);
    this.collectionParticipationService = new CollectionParticipationService(connection);
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
   * Get a collection by id.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<(CollectionParticipant & SystemUserWithRoles)[]>}
   * @memberof CollectionService
   */
  async getCollectionParticipants(collectionId: number): Promise<(CollectionParticipant & SystemUserWithRoles)[]> {
    return this.collectionParticipationService.getCollectionParticipants(collectionId);
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
    for (const participant of collection.participants)
      await this.collectionParticipationService.insertCollectionParticipant(
        collectionResponse.collection_id,
        participant
      );

    return collectionResponse;
  }

  /**
   * Update a collection record.
   *
   * @param {number} collectionId
   * @param {IPostCollection} collection
   * @return {*}  {Promise<CollectionModel>}
   * @memberof CollectionService
   */
  async updateCollection(collectionId: number, collection: IPostCollection): Promise<CollectionModel> {
    return this.collectionRepository.updateCollection(collectionId, collection);
  }
}
