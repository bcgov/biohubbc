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
   * @memberof SubmissionService
   */
  async getPermitBySurveyId(surveyId: number): Promise<IPermitModel[]> {
    return this.permitRepository.getPermitBySurveyId(surveyId);
  }

  /**
   * Get permit by user.
   *
   * @param
   * @return {*}  {IPermitModel[]}
   * @memberof SubmissionService
   */
  async getPermitByUser(): Promise<IPermitModel[]> {
    return this.permitRepository.getPermitByUser();
  }
}
