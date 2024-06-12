import { IDBConnection } from '../database/db';
import { InsertSampleBlockRecord } from '../repositories/sample-blocks-repository';
import {
  InsertSampleSiteRecord,
  SampleLocationRecord,
  SampleLocationRepository,
  SampleSiteRecord,
  UpdateSampleLocationRecord
} from '../repositories/sample-location-repository';
import { InsertSampleMethodRecord } from '../repositories/sample-method-repository';
import { InsertSampleStratumRecord } from '../repositories/sample-stratums-repository';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { SampleBlockService } from './sample-block-service';
import { SampleMethodService } from './sample-method-service';
import { SampleStratumService } from './sample-stratum-service';

export interface PostSampleLocations {
  survey_sample_site_id: number | null;
  survey_id: number;
  survey_sample_sites: InsertSampleSiteRecord[];
  sample_methods: InsertSampleMethodRecord[];
  blocks: InsertSampleBlockRecord[];
  stratums: InsertSampleStratumRecord[];
}

const defaultLog = getLogger('services/sample-location-service');

/**
 * Sample Location Repository
 *
 * @export
 * @class SampleLocationService
 * @extends {DBService}
 */
export class SampleLocationService extends DBService {
  sampleLocationRepository: SampleLocationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleLocationRepository = new SampleLocationRepository(connection);
  }

  /**
   * Gets a paginated set of survey Sample Locations for the given survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationService
   */
  async getSampleLocationsForSurveyId(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SampleLocationRecord[]> {
    return this.sampleLocationRepository.getSampleLocationsForSurveyId(surveyId, pagination);
  }

  /**
   * Returns the total count of sample locations belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SampleLocationService
   */
  async getSampleLocationsCountBySurveyId(surveyId: number): Promise<number> {
    return this.sampleLocationRepository.getSampleLocationsCountBySurveyId(surveyId);
  }

  /**
   * Gets a sample site record by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationService
   */
  async getSurveySampleSiteById(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecord> {
    return this.sampleLocationRepository.getSurveySampleSiteById(surveyId, surveySampleSiteId);
  }

  /**
   * Gets a sample location by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async getSurveySampleLocationBySiteId(surveyId: number, surveySampleSiteId: number): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.getSurveySampleLocationBySiteId(surveyId, surveySampleSiteId);
  }

  /**
   * Deletes a survey Sample Location.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationService
   */
  async deleteSampleSiteRecord(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecord> {
    const sampleMethodService = new SampleMethodService(this.connection);
    const sampleBlockService = new SampleBlockService(this.connection);
    const sampleStratumService = new SampleStratumService(this.connection);

    // Delete all methods associated with the sample location
    const existingSampleMethods = await sampleMethodService.getSampleMethodsForSurveySampleSiteId(
      surveyId,
      surveySampleSiteId
    );
    for (const item of existingSampleMethods) {
      await sampleMethodService.deleteSampleMethodRecord(surveyId, item.survey_sample_method_id);
    }

    // Delete all blocks associated with the sample location
    const existingSampleBlocks = await sampleBlockService.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

    await sampleBlockService.deleteSampleBlockRecords(existingSampleBlocks.map((item) => item.survey_sample_block_id));

    // Delete all stratums associated with a sample location
    const existingSampleStratums = await sampleStratumService.getSampleStratumsForSurveySampleSiteId(
      surveySampleSiteId
    );

    await sampleStratumService.deleteSampleStratumRecords(
      existingSampleStratums.map((item) => item.survey_sample_stratum_id)
    );

    // Lastly, delete the site itself
    return this.sampleLocationRepository.deleteSampleSiteRecord(surveyId, surveySampleSiteId);
  }

  /**
   * Inserts survey sample locations (a survey_sample_site record plus associated survey_sample_method and
   * survey_sample_period records).
   *
   * It is a business requirement to use strings from the properties field of provided geometry
   * to determine the name and description of sampling locations when possible.
   *
   * If there is no string contained in the fields 'name', 'label' to be used in our db,
   * the system will auto-generate a name of 'Sampling Site #x', where x is taken from the greatest value
   * integer id + 1 in the db.
   *
   * @param {PostSampleLocations} sampleLocations
   * @return {*}  {Promise<SampleSiteRecord[]>}
   * @memberof SampleLocationService
   */
  async insertSampleLocations(sampleLocations: PostSampleLocations): Promise<SampleSiteRecord[]> {
    defaultLog.debug({ label: 'insertSampleLocations' });

    // Create a sample site record for each feature found
    const promises = sampleLocations.survey_sample_sites.map((sampleLocation) => {
      return this.sampleLocationRepository.insertSampleSite(sampleLocations.survey_id, sampleLocation);
    });

    const sampleSiteRecords = await Promise.all(promises);

    const methodService = new SampleMethodService(this.connection);
    const blockService = new SampleBlockService(this.connection);
    const stratumService = new SampleStratumService(this.connection);

    // Loop through all newly created sample sites
    // For reach sample site, create associated sample methods
    const methodPromises = sampleSiteRecords.map((sampleSiteRecord) =>
      sampleLocations.sample_methods.map((item) => {
        const sampleMethod = {
          survey_sample_site_id: sampleSiteRecord.survey_sample_site_id,
          method_technique_id: item.method_technique_id,
          description: item.description,
          sample_periods: item.sample_periods,
          method_response_metric_id: item.method_response_metric_id
        };
        return methodService.insertSampleMethod(sampleMethod);
      })
    );

    await Promise.all(methodPromises);

    // Loop through all newly created sample sites
    // For reach sample site, create associated sample blocks
    const blockPromises = sampleSiteRecords.map((sampleSiteRecord) =>
      sampleLocations.blocks.map((item) => {
        const sampleBlock = {
          survey_sample_site_id: sampleSiteRecord.survey_sample_site_id,
          survey_block_id: item.survey_block_id
        };
        return blockService.insertSampleBlock(sampleBlock);
      })
    );

    await Promise.all(blockPromises);

    // Loop through all newly created sample sites
    // For reach sample site, create associated sample stratums
    const stratumPromises = sampleSiteRecords.map((sampleSiteRecord) =>
      sampleLocations.stratums.map((item) => {
        const sampleStratum = {
          survey_sample_site_id: sampleSiteRecord.survey_sample_site_id,
          survey_stratum_id: item.survey_stratum_id
        };
        return stratumService.insertSampleStratum(sampleStratum);
      })
    );

    await Promise.all(stratumPromises);

    return sampleSiteRecords;
  }

  /**
   * Updates a survey entire Sample Site Record, with Location and associated methods and periods.
   *
   * @param {number} surveyId
   * @param {UpdateSampleLocationRecord} sampleSite
   * @memberof SampleLocationService
   */
  async updateSampleLocationMethodPeriod(surveyId: number, sampleSite: UpdateSampleLocationRecord) {
    const methodService = new SampleMethodService(this.connection);
    const blockService = new SampleBlockService(this.connection);
    const stratumService = new SampleStratumService(this.connection);
    
    // Update the main sample location
    await this.sampleLocationRepository.updateSampleSite(sampleSite);

    // Check for methods to delete
    await methodService.deleteSampleMethodsNotInArray(
      sampleSite.survey_id,
      sampleSite.survey_sample_site_id,
      sampleSite.methods
    );

    // Check for blocks to delete
    await blockService.deleteSampleBlocksNotInArray(sampleSite.survey_sample_site_id, sampleSite.blocks);

    // Check for stratums to delete
    await stratumService.deleteSampleStratumsNotInArray(sampleSite.survey_sample_site_id, sampleSite.stratums);

    // Loop through all blocks
    // For each block, check if it exists
    // If it exists, update it
    // If it does not exist, create it
    if (sampleSite.blocks) {
      for (const item of sampleSite.blocks) {
        if (!item.survey_sample_block_id) {
          const sampleBlock = {
            survey_sample_site_id: sampleSite.survey_sample_site_id,
            survey_block_id: item.survey_block_id
          };
          await blockService.insertSampleBlock(sampleBlock);
        }
      }
    }

    // Loop through all stratums
    // For each stratum, check if it exists
    // If it exists, update it
    // If it does not exist, create it
    for (const item of sampleSite.stratums) {
      if (!item.survey_sample_stratum_id) {
        const sampleStratum = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          survey_stratum_id: item.survey_stratum_id
        };
        await stratumService.insertSampleStratum(sampleStratum);
      }
    }

    // Loop through all methods
    // For each method, check if it exists
    // If it exists, update it
    // If it does not exist, create it
    for (const item of sampleSite.methods) {
      if (item.survey_sample_method_id) {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          survey_sample_method_id: item.survey_sample_method_id,
          method_technique_id: item.method_technique_id,
          method_response_metric_id: item.method_response_metric_id,
          description: item.description,
          sample_periods: item.sample_periods
        };
        await methodService.updateSampleMethod(surveyId, sampleMethod);
      } else {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          method_technique_id: item.method_technique_id,
          method_response_metric_id: item.method_response_metric_id,
          description: item.description,
          sample_periods: item.sample_periods
        };
        await methodService.insertSampleMethod(sampleMethod);
      }
    }
  }
}
