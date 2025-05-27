import { SURVEY_ROLE, SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { HTTP401 } from '../errors/http-error';
import {
  IAddMultipleSurveysToCollection,
  ICreateCollectionSurveyRequest,
  IDeleteCollectionSurveyRequest
} from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { CollectionSurveyRepository } from '../repositories/collection-survey-repository';
import { SurveyMember } from '../repositories/survey-member-repository';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';
import { SurveyMemberService } from './survey-member-service';
import { SurveyService } from './survey-service';
import { UserService } from './user-service';

/**
 * Service layer for managing surveys in collections.
 *
 * @export
 * @class CollectionSurveyService
 * @extends {DBService}
 */
export class CollectionSurveyService extends DBService {
  collectionSurveyRepository: CollectionSurveyRepository;
  userService: UserService;
  surveyService: SurveyService;
  surveyMemberService: SurveyMemberService;
  platformService: PlatformService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionSurveyRepository = new CollectionSurveyRepository(connection);
    this.userService = new UserService(connection);
    this.surveyMemberService = new SurveyMemberService(connection);
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
    // Get the system user
    const systemUser = await this.userService.getUserByGuid(systemUserGuid);

    // If the user is not an admin, perform role checks for each survey
    const isAdmin = systemUser?.role_names.some((role) =>
      [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR].includes(role as SYSTEM_ROLE)
    );

    if (!isAdmin) {
      // Fetch authorizations for all surveys
      const authorizations = await Promise.all(
        values.surveys.map((survey) =>
          this.surveyMemberService.getSurveyMemberBySurveyIdAndUserGuid(survey.survey_id, systemUserGuid)
        )
      );

      // Check that each survey has a valid role (ADMIN)
      const hasMissingRequiredRole = authorizations
        .filter((authorization): authorization is SurveyMember & SystemUserWithRoles => authorization !== null)
        .some((authorization) => {
          return ![SURVEY_ROLE.EDITOR, SURVEY_ROLE.ADMIN].includes(authorization.survey_role_name as SURVEY_ROLE);
        });

      if (hasMissingRequiredRole) {
        throw new HTTP401('You do not have access to all of the surveys');
      }
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
