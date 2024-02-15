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
   * Gets all survey Sample Blocks.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleBlockRecord[]> {
    return await this.sampleBlockRepository.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);
  }

  /**
   * Gets all survey Sample Blocks for a given Survey Block
   *
   * @param {number} surveySampleBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksForSurveyBlockId(surveyBlockId: number): Promise<SampleBlockRecord[]> {
    return await this.sampleBlockRepository.getSampleBlocksForSurveyBlockId(surveyBlockId);
  }

  /**
   * Gets count of all survey Sample Blocks for a given Survey Block
   *
   * @param {number} surveySampleBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof SampleBlockService
   */
  async getSampleBlocksCountForSurveyBlockId(surveyBlockId: number): Promise<{ sampleCount: number }> {
    return await this.sampleBlockRepository.getSampleBlocksCountForSurveyBlockId(surveyBlockId);
  }

  /**
   * Deletes a survey Sample Block.
   *
   * @param {number} surveySampleBlockId
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
  async deleteSampleBlockRecord(surveySampleBlockId: number): Promise<SampleBlockRecord> {
    return await this.sampleBlockRepository.deleteSampleBlockRecord(surveySampleBlockId);
  }

  /**
   * Inserts survey Sample Block
   *
   * @param {InsertSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
  async insertSampleBlock(sampleBlock: InsertSampleBlockRecord): Promise<SampleBlockRecord> {
    console.log(sampleBlock)
    const result = await this.sampleBlockRepository.insertSampleBlock(sampleBlock);
    console.log(result)

    return result
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

      // Check if any observations are associated with the blocks to be deleted
      for (const block of existingBlocksToDelete) {
        promises.push(this.deleteSampleBlockRecord(block.survey_sample_block_id));
      }

      await Promise.all(promises);
    }
  }

  /**
   * updates a survey Sample block.
   *
   * @param {InsertSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof SampleBlockService
   */
  async updateSampleBlock(sampleBlock: UpdateSampleBlockRecord): Promise<SampleBlockRecord> {
    // const samplePeriodService = new SamplePeriodService(this.connection);
    const sampleBlockService = new SampleBlockService(this.connection);

    // // Check for any sample periods to delete
    // await samplePeriodService.deleteSamplePeriodsNotInArray(sampleBlock.survey_sample_block_id, sampleBlock.periods);

    // Loop through all new sample periods
    // For each sample period, check if it exists in the existing list
    // If it does, update it, otherwise create it

    if (sampleBlock.survey_sample_block_id) {
      const result = await sampleBlockService.updateSampleBlock(sampleBlock);
      console.log(result);
      return result;
    } else {
      const result = await sampleBlockService.insertSampleBlock(sampleBlock);
      console.log(result);
      return result;
    }
  }
}
