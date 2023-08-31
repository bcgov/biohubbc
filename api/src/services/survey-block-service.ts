import { IDBConnection } from '../database/db';
import { SurveyBlock, SurveyBlockRecord, SurveyBlockRepository } from '../repositories/survey-block-repository';
import { DBService } from './db-service';

// const defaultLog = getLogger('services/survey-block-service');

export class SurveyBlockService extends DBService {
  surveyBlockRepository: SurveyBlockRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.surveyBlockRepository = new SurveyBlockRepository(connection);
  }

  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecord[]> {
    return await this.surveyBlockRepository.getSurveyBlocksForSurveyId(surveyId);
  }

  async deleteSurveyBlock(surveyBlockId: number): Promise<SurveyBlockRecord> {
    return this.surveyBlockRepository.deleteSurveyBlockRecord(surveyBlockId);
  }

  async updateInsertSurveyBlocks(blocks: SurveyBlock[]): Promise<void> {
    const insertUpdate: Promise<any>[] = [];

    blocks.forEach((item: SurveyBlock) => {
      if (item.survey_block_id) {
        insertUpdate.push(this.surveyBlockRepository.updateSurveyBlock(item));
      } else {
        insertUpdate.push(this.surveyBlockRepository.insertSurveyBlock(item));
      }
    });

    await Promise.all(insertUpdate);
  }

  async upsertSurveyBlocks(surveyId: number, blocks: SurveyBlock[]): Promise<void> {
    // all actions to take
    const promises: Promise<any>[] = [];
    // get old
    // delete not found
    // upsert the last
    const existingBlocks = await this.getSurveyBlocksForSurveyId(surveyId);
    const blocksToDelete = existingBlocks.filter(
      (item) => !blocks.find((incoming) => incoming.survey_block_id === item.survey_block_id)
    );
    blocksToDelete.forEach((item) => {
      promises.push(this.deleteSurveyBlock(item.survey_block_id));
    });

    promises.push(this.updateInsertSurveyBlocks(blocks));

    await Promise.all(promises);
  }
}
