import { IDBConnection } from '../database/db';
import { SiteSelectionData, SiteSelectionStrategyRepository, SurveyStratum, SurveyStratumRecord } from '../repositories/site-selection-strategy-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

const defaultLog = getLogger('repositories/site-selection-strategy-repository');

/**
 * Service for managing survey site selection strategies and stratums
 *
 * @export
 * @class SiteSelectionStrategyService
 * @extends {DBService}
 */
export class SiteSelectionStrategyService extends DBService {
  siteSelectionStrategyRepository: SiteSelectionStrategyRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.siteSelectionStrategyRepository = new SiteSelectionStrategyRepository(connection);
  }

  /**
   * Retrieves site selection strategies and 
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SiteSelectionData>}
   * @memberof SiteSelectionStrategyService
   */
  async getSiteSelectionDataBySurveyId(surveyId: number): Promise<SiteSelectionData> {
    return this.siteSelectionStrategyRepository.getSiteSelectionDataBySurveyId(surveyId);
  }

  async insertSurveySiteSelectionStrategies(surveyId: number, strategies: string[]): Promise<void> {
    return this.siteSelectionStrategyRepository.insertSurveySiteSelectionStrategies(surveyId, strategies);
  }

  async replaceSurveySiteSelectionStrategies(surveyId: number, strategies: string[]): Promise<void> {
    await this.siteSelectionStrategyRepository.deleteSurveySiteSelectionStrategies(surveyId);

    if (strategies.length > 0) {
      await this.insertSurveySiteSelectionStrategies(surveyId, strategies);
    }
  }

  /**
   * Receives an array of all stratums, that should be persisted for a particular survey, then
   * deletes, inserts and updates stratum records accordingly.
   *
   * @param {number} surveyId
   * @param {(Array<SurveyStratum | SurveyStratumRecord>)} stratums
   * @return {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async replaceSurveySiteSelectionStratums(
    surveyId: number,
    stratums: Array<SurveyStratum | SurveyStratumRecord>
  ): Promise<void> {
    const insertStratums: SurveyStratum[] = [];
    const updateStratums: SurveyStratumRecord[] = [];
    const existingSiteSelectionStrategies = await this.siteSelectionStrategyRepository.getSiteSelectionDataBySurveyId(surveyId);

    stratums.forEach((stratum) => {
      if ('survey_stratum_id' in stratum) {
        updateStratums.push(stratum);
      } else {
        insertStratums.push(stratum);
      }
    });

    const removeStratums = existingSiteSelectionStrategies.stratums.filter((stratum) => {
      return !updateStratums.some((updateStratum) => updateStratum.survey_stratum_id === stratum.survey_stratum_id);
    });

    defaultLog.debug({ insertStratums, updateStratums, removeStratums });

    if (removeStratums.length) {
      await this.deleteSurveyStratums(removeStratums.map((stratum) => stratum.survey_stratum_id));
    }

    if (updateStratums.length) {
      await this.updateSurveyStratums(surveyId, updateStratums);
    }

    if (insertStratums.length) {
      await this.insertSurveyStratums(surveyId, insertStratums);
    }
  }

  async insertSurveyStratums(surveyId: number, stratums: SurveyStratum[]): Promise<SurveyStratumRecord[]> {
    return this.siteSelectionStrategyRepository.insertSurveyStratums(surveyId, stratums);
  }

  async updateSurveyStratums(surveyId: number, stratums: SurveyStratumRecord[]): Promise<SurveyStratumRecord[]> {
    return this.siteSelectionStrategyRepository.updateSurveyStratums(surveyId, stratums);
  }

  async deleteSurveyStratums(stratumIds: number[]): Promise<any> {
    return this.siteSelectionStrategyRepository.deleteSurveyStratums(stratumIds);
  }
}
