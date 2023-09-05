import { IDBConnection } from '../database/db';
import { SurveyBlock, SurveyBlockRecord, SurveyBlockRepository } from '../repositories/survey-block-repository';
import { DBService } from './db-service';

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
    return await this.surveyBlockRepository.getSurveyBlocksForSurveyId(surveyId);
  }

  /**
   *  Deletes a survey block record.
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockService
   */
  async deleteSurveyBlock(surveyBlockId: number): Promise<SurveyBlockRecord> {
    return this.surveyBlockRepository.deleteSurveyBlockRecord(surveyBlockId);
  }

  /**
   * Insert or Updates Survey Block Records based on the existence of a survey_block_id
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @return {*} {Promise<void>}
   * @memberof SurveyBlockService
   */
  async updateInsertSurveyBlocks(surveyId: number, blocks: SurveyBlock[]): Promise<void> {
    const insertUpdate: Promise<any>[] = [];

    blocks.forEach((item: SurveyBlock) => {
      item.survey_id = surveyId;
      if (item.survey_block_id) {
        insertUpdate.push(this.surveyBlockRepository.updateSurveyBlock(item));
      } else {
        insertUpdate.push(this.surveyBlockRepository.insertSurveyBlock(item));
      }
    });

    await Promise.all(insertUpdate);
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
  async upsertSurveyBlocks(surveyId: number, blocks: SurveyBlock[]): Promise<void> {
    // all actions to take
    const promises: Promise<any>[] = [];

    // Get existing blocks
    const existingBlocks = await this.getSurveyBlocksForSurveyId(surveyId);

    // Filter out any
    const blocksToDelete = existingBlocks.filter(
      (item) => !blocks.find((incoming) => incoming.survey_block_id === item.survey_block_id)
    );

    blocksToDelete.forEach((item) => {
      promises.push(this.deleteSurveyBlock(item.survey_block_id));
    });

    // update or insert block data
    promises.push(this.updateInsertSurveyBlocks(surveyId, blocks));

    await Promise.all(promises);
  }
}
