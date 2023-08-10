import { IDBConnection } from '../database/db';
import {
  FundingSource,
  FundingSourceBasicSupplementaryData,
  FundingSourceRepository,
  SurveyFundingSource
} from '../repositories/funding-source-repository';
import { DBService } from './db-service';

export interface IFundingSourceSearchParams {
  name?: string;
}

export interface ICreateFundingSource {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export class FundingSourceService extends DBService {
  fundingSourceRepository: FundingSourceRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.fundingSourceRepository = new FundingSourceRepository(connection);
  }

  /**
   * Get all funding sources.
   *
   * @return {*}  {(Promise<(FundingSource | FundingSourceBasicSupplementaryData)[]>)}
   * @memberof FundingSourceService
   */
  async getFundingSources(
    searchParams: IFundingSourceSearchParams
  ): Promise<(FundingSource | FundingSourceBasicSupplementaryData)[]> {
    const fundingSources = await this.fundingSourceRepository.getFundingSources(searchParams);

    return Promise.all(
      fundingSources.map(async (fundingSource) => {
        const basicSupplementalData = await this.fundingSourceRepository.getFundingSourceBasicSupplementaryData(
          fundingSource.funding_source_id
        );
        return { ...fundingSource, ...basicSupplementalData };
      })
    );
  }

  /**
   * Fetch a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSource>}
   * @memberof FundingSourceService
   */
  async getFundingSource(fundingSourceId: number): Promise<FundingSource> {
    return this.fundingSourceRepository.getFundingSource(fundingSourceId);
  }

  /**
   * Update a single funding source.
   *
   * @param {FundingSource} fundingSource
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceService
   */
  async putFundingSource(fundingSource: FundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
    return this.fundingSourceRepository.putFundingSource(fundingSource);
  }

  /**
   *
   * This assumes that the name of the funding source is unique
   * @param newFundingSource
   * @returns
   */
  async postFundingSource(newFundingSource: ICreateFundingSource): Promise<{ funding_source_id: number }> {
    return this.fundingSourceRepository.postFundingSource(newFundingSource);
  }

  /**
   * Delete a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceService
   */
  async deleteFundingSource(fundingSourceId: number): Promise<Pick<FundingSource, 'funding_source_id'>> {
    return this.fundingSourceRepository.deleteFundingSource(fundingSourceId);
  }

  /*
   * SURVEY FUNDING SOURCE FUNCTIONS
   */

  /**
   * Fetch a single survey funding source by survey id and funding source id.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @return {*}  {Promise<SurveyFundingSource>}
   * @memberof FundingSourceService
   */
  async getSurveyFundingSourceByFundingSourceId(
    surveyId: number,
    fundingSourceId: number
  ): Promise<SurveyFundingSource> {
    return this.fundingSourceRepository.getSurveyFundingSourceByFundingSourceId(surveyId, fundingSourceId);
  }

  /**
   * Fetch all survey funding sources by survey id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyFundingSource[]>}
   * @memberof FundingSourceService
   */
  async getSurveyFundingSources(surveyId: number): Promise<SurveyFundingSource[]> {
    return this.fundingSourceRepository.getSurveyFundingSources(surveyId);
  }

  /**
   * Insert a new survey funding source record into survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @param {number} amount
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceService
   */
  async postSurveyFundingSource(surveyId: number, fundingSourceId: number, amount: number): Promise<void> {
    return this.fundingSourceRepository.postSurveyFundingSource(surveyId, fundingSourceId, amount);
  }

  /**
   * Update a survey funding source record in survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @param {number} amount
   * @param {number} revision_count
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceService
   */
  async putSurveyFundingSource(
    surveyId: number,
    fundingSourceId: number,
    amount: number,
    revision_count: number
  ): Promise<void> {
    return this.fundingSourceRepository.putSurveyFundingSource(surveyId, fundingSourceId, amount, revision_count);
  }

  /**
   * Delete a survey funding source record from survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceService
   */
  async deleteSurveyFundingSource(surveyId: number, fundingSourceId: number): Promise<void> {
    return this.fundingSourceRepository.deleteSurveyFundingSource(surveyId, fundingSourceId);
  }
}
