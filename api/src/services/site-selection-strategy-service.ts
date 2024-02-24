import { IDBConnection } from '../database/db';
import {
  SiteSelectionData,
  SiteSelectionStrategyRepository,
  SurveyStratum,
  SurveyStratumRecord
} from '../repositories/site-selection-strategy-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { SampleStratumService } from './sample-stratum-service';

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
   * Retrieves site selection strategies and stratums
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SiteSelectionData>}
   * @memberof SiteSelectionStrategyService
   */
  async getSiteSelectionDataBySurveyId(surveyId: number): Promise<SiteSelectionData> {
    return this.siteSelectionStrategyRepository.getSiteSelectionDataBySurveyId(surveyId);
  }

  /**
   * Attaches numerous site selection strategies to the given survey
   *
   * @param {number} surveyId
   * @param {string[]} strategies
   * @return {*}  {Promise<void>}
   * @memberof SiteSelectionStrategyService
   */
  async insertSurveySiteSelectionStrategies(surveyId: number, strategies: string[]): Promise<void> {
    return this.siteSelectionStrategyRepository.insertSurveySiteSelectionStrategies(surveyId, strategies);
  }

  /**
   * Replaces all of the site selection strategies for the given survey, first by deleting
   * all existing records, then inserting the new ones
   *
   * @param {number} surveyId
   * @param {string[]} strategies
   * @return {*}  {Promise<void>}
   * @memberof SiteSelectionStrategyService
   */
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
    defaultLog.debug({ label: 'replaceSurveySiteSelectionStratums' });

    const insertStratums: SurveyStratum[] = [];
    const updateStratums: SurveyStratumRecord[] = [];

    const existingSiteSelectionStrategies = await this.siteSelectionStrategyRepository.getSiteSelectionDataBySurveyId(
      surveyId
    );

    stratums.forEach((stratum) => {
      if ('survey_stratum_id' in stratum) {
        updateStratums.push(stratum);
      } else {
        insertStratums.push(stratum);
      }
    });

    const removeStratums = existingSiteSelectionStrategies.stratums
      .filter(
        (stratum) =>
          !updateStratums.some((updateStratum) => updateStratum.survey_stratum_id === stratum.survey_stratum_id)
      )
      .map((stratum) => stratum.survey_stratum_id);

    if (removeStratums.length) {
      await this.deleteSurveyStratums(removeStratums);
    }

    if (updateStratums.length) {
      await this.updateSurveyStratums(surveyId, updateStratums);
    }

    if (insertStratums.length) {
      await this.insertSurveyStratums(surveyId, insertStratums);
    }
  }

  /**
   * Inserts new survey stratums
   *
   * @param {number} surveyId
   * @param {SurveyStratum[]} stratums
   * @return {*}  {Promise<SurveyStratumRecord[]>}
   * @memberof SiteSelectionStrategyService
   */
  async insertSurveyStratums(surveyId: number, stratums: SurveyStratum[]): Promise<SurveyStratumRecord[]> {
    return this.siteSelectionStrategyRepository.insertSurveyStratums(surveyId, stratums);
  }

  /**
   * Updates all of the given survey stratums
   *
   * @param {number} surveyId
   * @param {SurveyStratumRecord[]} stratums
   * @return {*}  {Promise<SurveyStratumRecord[]>}
   * @memberof SiteSelectionStrategyService
   */
  async updateSurveyStratums(surveyId: number, stratums: SurveyStratumRecord[]): Promise<SurveyStratumRecord[]> {
    return this.siteSelectionStrategyRepository.updateSurveyStratums(surveyId, stratums);
  }

  /**
   * Deletes all of the given survey stratums by the survey stratum ID
   *
   * @param {number[]} stratumIds
   * @return {*}  {Promise<any>}
   * @memberof SiteSelectionStrategyService
   */
  async deleteSurveyStratums(stratumIds: number[]): Promise<number> {
    const sampleStratumService = new SampleStratumService(this.connection);

    // Deletes the joins between survey_stratum and survey_sample_stratum
    await sampleStratumService.deleteSampleStratumRecordsByStratumIds(stratumIds);

    // Deletes the Survey Stratum
    return this.siteSelectionStrategyRepository.deleteSurveyStratums(stratumIds);
  }
}
