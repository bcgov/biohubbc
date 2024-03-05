import { IDBConnection } from '../database/db';
import { PostSurveyBlock, SurveyBlockRecord, SurveyBlockRepository } from '../repositories/survey-block-repository';
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
   * @return {*} {Promise<SurveyBlockRecord[]>}
   * @returns
   */
  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecord[]> {
    return this.surveyBlockRepository.getSurveyBlocksForSurveyId(surveyId);
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
   * Inserts, Updates and Deletes Block records
   * All passed in blocks are treated as the source of truth,
   * Any pre existing blocks that do not collide with passed in blocks are deleted
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<void>}
   * @memberof SurveyBlockService
   */
  async upsertSurveyBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<void> {
    // all actions to take
    const promises: Promise<any>[] = [];

    // Get existing blocks
    const existingBlocks = await this.getSurveyBlocksForSurveyId(surveyId);

    // Filter out any blocks to delete
    const blocksToDelete = existingBlocks.filter(
      (item) => !blocks.find((incoming) => incoming.survey_block_id === item.survey_block_id)
    );

    blocksToDelete.forEach((block) => {
      promises.push(this.deleteSurveyBlock(block.survey_block_id));
    });

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
