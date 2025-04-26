import { PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP401 } from '../errors/http-error';
import {
  IAddMultipleSurveysToCollection,
  ICollectionAdvancedFilters,
  ICreateCollectionSurveyRequest,
  IDeleteCollectionSurveyRequest
} from '../models/collection';
import { CollectionSurveyRepository } from '../repositories/collection-survey-repository';
import { SurveyBasicFields } from '../repositories/survey-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { ProjectParticipationService } from './project-participation-service';
import { SurveyService } from './survey-service';

/**
 * Service layer for managing surveys in collections.
 *
 * @export
 * @class CollectionSurveyService
 * @extends {DBService}
 */
export class CollectionSurveyService extends DBService {
  collectionSurveyRepository: CollectionSurveyRepository;
  projectParticipationService: ProjectParticipationService;
  surveyService: SurveyService;
  platformService: PlatformService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionSurveyRepository = new CollectionSurveyRepository(connection);
    this.projectParticipationService = new ProjectParticipationService(connection);
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
   * @param {ICollectionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyBasicFields[]>}
   * @memberof SurveyService
   */
  async getSurveysBasicFieldsByCollectionId(
    collectionId: number,
    filterFields?: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyBasicFields[]> {
    const surveys = await this.surveyService.getSurveysBasicFieldsByCollectionId(
      collectionId,
      filterFields,
      pagination
    );

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
  async addSurveyToMultipleCollections(values: ICreateCollectionSurveyRequest): Promise<void> {
    await Promise.all(
      values.collections.map((collection) =>
        this.collectionSurveyRepository.createCollectionSurvey({
          survey_id: values.survey_id,
          collection_id: collection.collection_id
        })
      )
    );
  }

  /**
   * Adds multiple surveys to a collection
   *
   * @param {string} systemUserGuid
   * @param {IAddMultipleSurveysToCollection} values
   * @return {*}  {Promise<void>}
   * @memberof CollectionSurveyService
   */
  async addMultipleSurveysToCollection(systemUserGuid: string, values: IAddMultipleSurveysToCollection): Promise<void> {
    const authChecks: string[][] = []; // Store role names for each survey

    // Get the participant project roles for the given surveys
    for (const survey of values.surveys) {
      const authorization = await this.projectParticipationService.getProjectParticipantBySurveyIdAndUserGuid(
        survey.survey_id,
        systemUserGuid
      );
      // Push the project role names for each survey
      if (authorization) {
        authChecks.push(authorization.project_role_names);
      }
    }

    // Check if any of the roles in authChecks contains invalid roles (e.g., COLLABORATOR, COORDINATOR)
    const hasInvalidRole = authChecks.some((roles) =>
      roles.some((role) => [PROJECT_ROLE.COLLABORATOR, PROJECT_ROLE.COORDINATOR].includes(role as PROJECT_ROLE))
    );

    // If any invalid role is found, throw Error401
    if (hasInvalidRole) {
      throw new HTTP401('You do not have access to some of the surveys');
    }

    // Proceed to add surveys to the collection
    await Promise.all(
      values.surveys.map((survey) =>
        this.collectionSurveyRepository.createCollectionSurvey({
          survey_id: survey.survey_id,
          collection_id: values.collection_id
        })
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
