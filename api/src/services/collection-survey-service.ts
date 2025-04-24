import { IDBConnection } from '../database/db';
import { ICreateCollectionSurveyRequest, IDeleteCollectionSurveyRequest } from '../models/collection';
import { CollectionRepository } from '../repositories/collection-repository';
import { CollectionSurveyRepository } from '../repositories/collection-survey-repository';
import { SurveyBasicFields } from '../repositories/survey-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { SurveyService } from './survey-service';

/**
 * Service layer for managing surveys in collections.
 *
 * @export
 * @class CollectionSurveyService
 * @extends {DBService}
 */
export class CollectionSurveyService extends DBService {
  collectionRepository: CollectionRepository;
  collectionSurveyRepository: CollectionSurveyRepository;
  surveyService: SurveyService;
  platformService: PlatformService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionRepository = new CollectionRepository(connection);
    this.collectionSurveyRepository = new CollectionSurveyRepository(connection);
    this.surveyService = new SurveyService(connection);
    this.platformService = new PlatformService(connection);
  }

  /**
   * Get surveys in the given collection
   *
   * @param {number} collectionId
   * @returns
   */
  async getSurveysInCollection(collectionId: number): Promise<{ survey_id: number }[]> {
    return this.collectionSurveyRepository.getSurveysInCollection(collectionId);
  }

  /**
   * Get the count of surveys in a collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getSurveyCountByCollectionId(collectionId: number): Promise<number> {
    return this.collectionSurveyRepository.getSurveyCountByCollectionId(collectionId);
  }

  /**
   * Fetches a subset of survey fields for a paginated list of surveys under
   * a given project.
   *
   * @param {number} collectionId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyBasicFields[]>}
   * @memberof SurveyService
   */
  async getSurveysBasicFieldsByCollectionId(
    collectionId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyBasicFields[]> {
    const surveys = await this.surveyService.getSurveysBasicFieldsByCollectionId(collectionId, pagination);

    // Build an array of all unique focal species ids from all surveys
    const uniqueFocalSpeciesIds = Array.from(
      new Set(surveys.reduce((ids: number[], survey) => ids.concat(survey.focal_species), []))
    );

    // Fetch focal species data for all species ids
    const platformService = new PlatformService(this.connection);
    const focalSpecies = await platformService.getTaxonomyByTsns(uniqueFocalSpeciesIds);

    // Decorate the surveys response with their matching focal species labels
    const decoratedSurveys: SurveyBasicFields[] = [];
    for (const survey of surveys) {
      const matchingFocalSpeciesNames = focalSpecies
        .filter((item) => survey.focal_species.includes(item.tsn))
        .map((item) => [item.commonNames, `(${item.scientificName})`].filter(Boolean).join(' '));

      decoratedSurveys.push({ ...survey, focal_species_names: matchingFocalSpeciesNames });
    }

    return decoratedSurveys;
  }

  /**
   * Add a survey to collections
   *
   * @param {ICreateCollectionSurveyRequest} values
   * @return {*}  {Promise<void>}
   * @memberof CollectionSurveyService
   */
  async createCollectionSurveys(values: ICreateCollectionSurveyRequest): Promise<void> {
    await Promise.all(
      values.collections.map((collection) =>
        this.collectionSurveyRepository.createCollectionSurvey(values.survey_id, collection.collection_id)
      )
    );
  }

  /**
   * Remove a survey from collections
   *
   * @param {IDeleteCollectionSurveyRequest} values
   * @return {*}  {Promise<void>}
   * @memberof CollectionSurveyService
   */
  async deleteCollectionSurveys(values: IDeleteCollectionSurveyRequest): Promise<void> {
    await Promise.all(
      values.collections.map((collection) =>
        this.collectionSurveyRepository.deleteCollectionSurvey(values.survey_id, collection.collection_id)
      )
    );
  }
}
