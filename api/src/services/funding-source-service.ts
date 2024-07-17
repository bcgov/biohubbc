import { IDBConnection } from '../database/db';
import {
  FundingSource,
  FundingSourceRepository,
  FundingSourceSupplementaryData,
  SurveyFundingSource,
  SurveyFundingSourceSupplementaryData
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
   * @return {*}  {(Promise<(FundingSource & FundingSourceSupplementaryData)[]>)}
   * @memberof FundingSourceService
   */
  async getFundingSources(
    searchParams: IFundingSourceSearchParams
  ): Promise<(FundingSource & FundingSourceSupplementaryData)[]> {
    const fundingSources = await this.fundingSourceRepository.getFundingSources(searchParams);

    return Promise.all(
      fundingSources.map(async (fundingSource) => {
        const fundingSourceSupplementaryData = await this.fundingSourceRepository.getFundingSourceSupplementaryData(
          fundingSource.funding_source_id
        );
        return { ...fundingSource, ...fundingSourceSupplementaryData };
      })
    );
  }

  /**
   * Fetch a single funding source and its survey references.
   *
   * @param {number} fundingSourceId
   * @return {*}  {(Promise<{
   *     funding_source: FundingSource & FundingSourceSupplementaryData;
   *     funding_source_survey_references: (SurveyFundingSource | SurveyFundingSourceSupplementaryData)[];
   *   }>)}
   * @memberof FundingSourceService
   */
  async getFundingSource(fundingSourceId: number): Promise<{
    funding_source: FundingSource & FundingSourceSupplementaryData;
    funding_source_survey_references: (SurveyFundingSource | SurveyFundingSourceSupplementaryData)[];
  }> {
    const results = await Promise.all([
      this.fundingSourceRepository.getFundingSource(fundingSourceId),
      this.fundingSourceRepository.getFundingSourceSurveyReferences(fundingSourceId)
    ]);

    return { funding_source: results[0], funding_source_survey_references: results[1] };
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
  async postFundingSource(newFundingSource: ICreateFundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
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
