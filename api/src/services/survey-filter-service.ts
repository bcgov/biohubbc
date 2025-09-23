import { SurveyFilterRecord } from '../database-models/survey-filter';
import { IDBConnection } from '../database/db';
import { PostSurveyFilter, SurveyFilterRepository } from '../repositories/survey-filter-repository';
import { DBService } from './db-service';

export class SurveyFilterService extends DBService {
  surveyFilterRepository: SurveyFilterRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyFilterRepository = new SurveyFilterRepository(connection);
  }

  /**
   * Gets survey filters for the given user
   *
   * @param {number} systemUserId
   * @return {romise<SurveyFilterRecord[]>}
   * @memberof SurveyFilterService
   */
  async findSurveyFilters(systemUserId: number): Promise<SurveyFilterRecord[]> {
    return this.surveyFilterRepository.getSurveyFiltersForSystemUser(systemUserId);
  }

  /**
   * Fetch a single survey filter by its id
   *
   * @param {PostSurveyFilter} surveyFilter
   * @return {Promise<SurveyFilter>}
   * @memberof SurveyFilterService
   */
  async createSurveyFilter(surveyFilter: PostSurveyFilter): Promise<void> {
    await this.surveyFilterRepository.insertSurveyFilter(surveyFilter);
  }

  /**
   * Deletes a specific survey filter
   *
   * @param {number} surveyFilterId
   * @param {number} systemUserId
   * @return {Promise<SurveyFilterRecord>}
   * @memberof SurveyFilterService
   */
  async deleteSurveyFilter(surveyFilterId: number, systemUserId: number): Promise<SurveyFilterRecord> {
    const response = await this.surveyFilterRepository.deleteSurveyFilterRecord(surveyFilterId, systemUserId);

    return response;
  }
}
