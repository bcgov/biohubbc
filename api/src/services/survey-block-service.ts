import { SurveyBlockRecord } from '../database-models/survey_block';
import { IDBConnection } from '../database/db';
import {
  PostSurveyBlock,
  SurveyBlockNonSpatial,
  SurveyBlockRepository,
  SurveyBlockWithCount
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
   * Gets a survey block by its id
   *
   * @param {number} surveyId
   * @param {number} surveyBlockId
   * @return {*} {Promise<SurveyBlockWithCount>}
   * @returns
   */
  async getSurveyBlockById(surveyId: number, surveyBlockId: number): Promise<SurveyBlockWithCount> {
    return this.surveyBlockRepository.getSurveyBlockById(surveyId, surveyBlockId);
  }

  /**
   * Gets survey blocks for the given survey
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
   * Returns the total count of survey blocks in the given survey.
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
   * @param {number} surveyId
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockService
   */
  async deleteSurveyBlock(surveyId: number, surveyBlockId: number): Promise<SurveyBlockRecord> {
    const sampleBlockService = new SampleBlockService(this.connection);

    // When a Survey Block is deleted, also delete its associations to sampling sites
    await sampleBlockService.deleteSampleBlockRecordsByBlockIds(surveyId, [surveyBlockId]);

    return this.surveyBlockRepository.deleteSurveyBlockRecord(surveyId, surveyBlockId);
  }

  /**
   * Inserts blocks for the survey
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<any[]>} - Returns an array of responses from insertSurveyBlock
   * @memberof SurveyBlockService
   */
  async insertSurveyBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<SurveyBlockRecord[]> {
    const promises = blocks.map((item: PostSurveyBlock) => {
      item.survey_id = surveyId;
      return this.surveyBlockRepository.insertSurveyBlock(item);
    });

    // Wait for all insertions to complete and return the responses
    return Promise.all(promises);
  }
  /**
   * Updates existing survey blocks and inserts any new survey blocks without a survey_block_id
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<void>}
   * @memberof SurveyBlockService
   */
  async upsertSurveyBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<void> {
    const promises: Promise<any>[] = [];

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
