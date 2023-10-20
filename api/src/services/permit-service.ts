import { SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { IPermitModel, PermitRepository } from '../repositories/permit-repository';
import { DBService } from './db-service';
import { UserService } from './user-service';
export class PermitService extends DBService {
  permitRepository: PermitRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.permitRepository = new PermitRepository(connection);
  }

  /**
   * Get permit by id.
   *
   * @param {number} surveyId
   * @return {*}  {IPermitModel[]}
   * @memberof PermitService
   */
  async getPermitBySurveyId(surveyId: number): Promise<IPermitModel[]> {
    return this.permitRepository.getPermitBySurveyId(surveyId);
  }

  /**
   * Get permit by user.
   *
   * @param
   * @return {*}  {IPermitModel[]}
   * @memberof PermitService
   */
  async getPermitByUser(systemUserId: number): Promise<IPermitModel[]> {
    const userService = new UserService(this.connection);
    const userObject = await userService.getUserById(systemUserId);

    if (
      userObject.role_names.includes(SYSTEM_ROLE.SYSTEM_ADMIN) ||
      userObject.role_names.includes(SYSTEM_ROLE.DATA_ADMINISTRATOR)
    ) {
      return this.permitRepository.getAllPermits();
    }

    return this.permitRepository.getPermitByUser(systemUserId);
  }

  /**
   * Create and associate permit for survey.
   *
   * @param {number} surveyId
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  {IPermitModel[]}
   * @memberof PermitService
   */
  async createSurveyPermit(surveyId: number, permitNumber: string, permitType: string): Promise<number | null> {
    return this.permitRepository.createSurveyPermit(surveyId, permitNumber, permitType);
  }

  /**
   * Update a survey permit.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  {IPermitModel[]}
   * @memberof PermitService
   */
  async updateSurveyPermit(
    surveyId: number,
    permitId: number,
    permitNumber: string,
    permitType: string
  ): Promise<number> {
    return this.permitRepository.updateSurveyPermit(surveyId, permitId, permitNumber, permitType);
  }

  /**
   * Delete a survey permit.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @return {*}  QueryResult<any>
   * @memberof PermitService
   */
  async deleteSurveyPermit(surveyId: number, permitId: number): Promise<number> {
    return this.permitRepository.deleteSurveyPermit(surveyId, permitId);
  }
}
