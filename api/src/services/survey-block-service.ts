import { IDBConnection } from '../database/db';
import {
  PostSurveyBlock,
  SurveyBlockNonSpatial,
  SurveyBlockRecord,
  SurveyBlockRepository
} from '../repositories/survey-block-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { SampleBlockService } from './sample-block-service';

export class SurveyBlockService extends DBService {
  surveyBlockRepository: SurveyBlockRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.surveyBlockRepository = new SurveyBlockRepository(connection);
  }

  /**
   * Gets Block Survey Records for a given survey id
   *
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       sampleSiteIds?: number[];
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*} {Promise<SurveyBlockRecordWithCount[]>}
   * @returns
   */
  async getSurveyBlocksForSurveyId(
    surveyId: number,
    options?: {
      keyword?: string;
      sampleSiteIds?: number[];
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SurveyBlockNonSpatial[]> {
    return this.surveyBlockRepository.getSurveyBlocksForSurveyId(surveyId, options);
  }

  /**
   * Returns the total count of survey blocks belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SurveyBlockService
   */
  async getSurveyBlocksCountBySurveyId(surveyId: number): Promise<number> {
    return this.surveyBlockRepository.getSurveyBlocksCountBySurveyId(surveyId);
  }

  /**
   *  Deletes a survey block record.
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockService
   */
  async deleteSurveyBlock(surveyBlockId: number): Promise<SurveyBlockRecord> {
    const sampleBlockService = new SampleBlockService(this.connection);

    // When a Survey Block is deleted, also delete its associations to sampling sites to avoid orphaned Sample Block records
    await sampleBlockService.deleteSampleBlockRecordsByBlockIds([surveyBlockId]);

    return this.surveyBlockRepository.deleteSurveyBlockRecord(surveyBlockId);
  }

  /**
   * Inserts blocks for the survey
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<void>}
   * @memberof SurveyBlockService
   */
  async insertSurveyBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<void> {
    const promises: Promise<any>[] = [];

    blocks.forEach((item: PostSurveyBlock) => {
      item.survey_id = surveyId;
      promises.push(this.surveyBlockRepository.insertSurveyBlock(item));
    });

    await Promise.all(promises);
  }

  /**
   * Updates existing survey blocks and inserts any new survey blocks without a survey_block_id
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<void>}
   * @memberof SurveyBlockService
   */
  async updateSurveyBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<void> {
    const promises: Promise<any>[] = [];

    // update or insert block data
    blocks.forEach((item: PostSurveyBlock) => {
      item.survey_id = surveyId;
      if (item.survey_block_id) {
        promises.push(this.surveyBlockRepository.updateSurveyBlock(item));
      } else {
        promises.push(this.surveyBlockRepository.insertSurveyBlock(item));
      }
    });

    await Promise.all(promises);
  }
}
