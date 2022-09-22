import { IDBConnection } from '../database/db';
import { IPermitModel, PermitRepository } from '../repositories/permit-repository';
import { DBService } from './service';

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
  async getPermitByUser(): Promise<IPermitModel[]> {
    return this.permitRepository.getPermitByUser();
  }

  /**
   * Create and associate permit for survey.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  {IPermitModel[]}
   * @memberof PermitService
   */
  async createSurveyPermit(
    surveyId: number,
    permitId: number,
    permitNumber: string,
    permitType: string
  ): Promise<number | null> {
    const permit_id = await this.permitRepository.createSurveyPermit(permitNumber, permitType);

    const survey_permit_id = await this.permitRepository.upsertPermitToSurvey(surveyId, permit_id);

    if (!permit_id || !survey_permit_id) {
      return null;
    }

    return permit_id;
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
    const permit_id = await this.permitRepository.deleteSurveyPermit(surveyId, permitId);

    await this.permitRepository.deleteUnassociatedPermits();

    return permit_id;
  }
}
