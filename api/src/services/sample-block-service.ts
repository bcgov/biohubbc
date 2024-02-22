import { IDBConnection } from '../database/db';
import {
  InsertSampleBlockRecord,
  SampleBlockRecord,
  SampleBlockRepository,
  UpdateSampleBlockRecord
} from '../repositories/sample-blocks-repository';
import { DBService } from './db-service';

/**
 * Sample Block Repository
 *
 * @export
 * @class SampleBlockService
 * @extends {DBService}
 */
export class SampleBlockService extends DBService {
  sampleBlockRepository: SampleBlockRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleBlockRepository = new SampleBlockRepository(connection);
  }

  /**
   * Gets all survey blocks assigned to a given sample site
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleBlockRecord[]> {
    return this.sampleBlockRepository.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);
  }

  /**
   * Gets all survey Sample Blocks for a given Survey Block that have been assigned to a sample site
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksForSurveyBlockId(surveyBlockId: number): Promise<SampleBlockRecord[]> {
    return this.sampleBlockRepository.getSampleBlocksForSurveyBlockId(surveyBlockId);
  }

  /**
   * Gets count of how many sampling sites a given survey block has been assigned to
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksCountForSurveyBlockId(surveyBlockId: number): Promise<{ sampleCount: number }> {
    return this.sampleBlockRepository.getSampleBlocksCountForSurveyBlockId(surveyBlockId);
  }

  /**
   * Deletes all associations between a given Survey Block and any sampling site
   *
   * @param {number} surveyBlockIds
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
  async deleteSampleBlockRecordsByBlockIds(surveyBlockIds: number[]): Promise<SampleBlockRecord[]> {
    return this.sampleBlockRepository.deleteSampleBlockRecordsByBlockIds(surveyBlockIds);
  }

   /**
   * Deletes specific Survey Sample Block records, removing the assignment of a Survey Block to a Sample Site
   *
   * @param {number} surveySampleBlockIds
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
   async deleteSampleBlockRecords(surveySampleBlockIds: number[]): Promise<SampleBlockRecord[]> {
    return this.sampleBlockRepository.deleteSampleBlockRecords(surveySampleBlockIds);
  }

  /**
   * Assigns a survey block to a sampling site
   *
   * @param {InsertSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
  async insertSampleBlock(sampleBlock: InsertSampleBlockRecord): Promise<SampleBlockRecord> {
    return this.sampleBlockRepository.insertSampleBlock(sampleBlock);
  }

  /**
   * Fetches and compares any existing sample blocks for a given sample site id.
   * Any sample blocks not found in the given array will be deleted.
   *
   * @param {number} surveySampleSiteId
   * @param {UpdateSampleBlockRecord[]} newBlocks
   * @memberof SampleBlockService
   */
  async deleteSampleBlocksNotInArray(surveySampleSiteId: number, newBlocks: UpdateSampleBlockRecord[]) {
    //Get any existing blocks for the sample site
    const existingBlocks = await this.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

    // Compare input and existing for blocks to delete
    // Any existing blocks that are not found in the new blocks being passed in will be collected for deletion
    const existingBlocksToDelete = existingBlocks.filter((existingBlock) => {
      return !newBlocks.find(
        (incomingBlock) => incomingBlock.survey_sample_block_id === existingBlock.survey_sample_block_id
      );
    });

    // Delete any blocks not found in the passed in array
    if (existingBlocksToDelete.length > 0) {
      const promises: Promise<any>[] = [];
      promises.push(this.deleteSampleBlockRecords(existingBlocksToDelete.map((block) => block.survey_sample_block_id)));
      await Promise.all(promises);
    }
  }
}
