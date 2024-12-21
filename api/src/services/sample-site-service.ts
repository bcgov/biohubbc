import { SurveySampleSiteModel } from '../database-models/survey_sample_site';
import { IDBConnection } from '../database/db';
import { ISiteAdvancedFilters } from '../models/sampling-locations-view';
import { InsertSampleBlockRecord } from '../repositories/sample-blocks-repository';
import {
  FindSampleSiteRecord,
  InsertSampleSiteRecord,
  SampleLocationRecord,
  SampleLocationRepository,
  SampleSiteGeometryRecord,
  UpdateSampleLocationRecord
} from '../repositories/sample-site-repository';
import { InsertSampleStratumRecord } from '../repositories/sample-stratums-repository';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { SampleBlockService } from './sample-block-service';
import { SampleStratumService } from './sample-stratum-service';

export interface PostSampleLocations {
  survey_sample_site_id: number | null;
  survey_id: number;
  survey_sample_sites: InsertSampleSiteRecord[];
  blocks: InsertSampleBlockRecord[];
  stratums: InsertSampleStratumRecord[];
}

const defaultLog = getLogger('services/sample-site-service');

/**
 * Sample Location Repository
 *
 * @export
 * @class SampleSiteService
 * @extends {DBService}
 */
export class SampleSiteService extends DBService {
  sampleLocationRepository: SampleLocationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleLocationRepository = new SampleLocationRepository(connection);
  }

  /**
   * Gets a paginated set of survey Sample Locations for the given survey.
   *
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       sampleSiteIds?: number[];
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleSiteService
   */
  async getSampleSitesForSurveyId(
    surveyId: number,
    options?: {
      keyword?: string;
      sampleSiteIds?: number[];
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SampleLocationRecord[]> {
    return this.sampleLocationRepository.getSampleSitesForSurveyId(surveyId, options);
  }

  /**
   * Returns the total count of sample locations belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteService
   */
  async getSampleLocationsCountBySurveyId(surveyId: number): Promise<number> {
    return this.sampleLocationRepository.getSampleLocationsCountBySurveyId(surveyId);
  }

  /**
   * Returns the geometry for all sampling locations in the Survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleSiteGeometryRecord[]>}
   * @memberof SampleSiteService
   */
  async getSampleLocationsGeometryBySurveyId(surveyId: number): Promise<SampleSiteGeometryRecord[]> {
    return this.sampleLocationRepository.getSampleLocationsGeometryBySurveyId(surveyId);
  }

  /**
   * Gets a sample site record by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteService
   */
  async getSurveySampleSiteById(surveyId: number, surveySampleSiteId: number): Promise<SurveySampleSiteModel> {
    return this.sampleLocationRepository.getSurveySampleSiteById(surveyId, surveySampleSiteId);
  }

  //   /**
  //    * Gets basic data for survey sample sites for supplementary observations data
  //    *
  //    * @param {number} surveyId
  //    * @param {number[]} surveySampleSiteIds
  //    * @return {*}  {Promise<SampleLocationBasicRecord[]>}
  //    * @memberof SampleSiteService
  //    */
  //   async getBasicSurveySampleLocationsBySiteIds(
  //     surveyId: number,
  //     surveySampleSiteIds: number[]
  //   ): Promise<SampleLocationBasicRecord[]> {
  //     return this.sampleLocationRepository.getBasicSurveySampleLocationsBySiteIds(surveyId, surveySampleSiteIds);
  //   }

  /**
   * Gets a sample location by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleSiteService
   */
  async getSurveySampleLocationBySiteId(surveyId: number, surveySampleSiteId: number): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.getSurveySampleLocationBySiteId(surveyId, surveySampleSiteId);
  }

  /**
   * Retrieves the paginated list of all sites that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ISiteAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindSampleSiteRecord[]>}
   * @memberof SampleSiteService
   */
  async findSites(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISiteAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindSampleSiteRecord[]> {
    return this.sampleLocationRepository.findSites(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all sites that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ISiteAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteService
   */
  async findSitesCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISiteAdvancedFilters
  ): Promise<number> {
    return this.sampleLocationRepository.findSitesCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Deletes a survey Sample Location.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteService
   */
  async deleteSampleSiteRecord(surveyId: number, surveySampleSiteId: number): Promise<SurveySampleSiteModel> {
    const sampleBlockService = new SampleBlockService(this.connection);
    const sampleStratumService = new SampleStratumService(this.connection);

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
   * @return {*}  {Promise<SurveySampleSiteModel[]>}
   * @memberof SampleSiteService
   */
  async insertSampleLocations(sampleLocations: PostSampleLocations): Promise<SurveySampleSiteModel[]> {
    defaultLog.debug({ label: 'insertSampleLocations' });

    // Create a sample site record for each feature found
    const promises = sampleLocations.survey_sample_sites.map((sampleLocation) => {
      return this.sampleLocationRepository.insertSampleSite(sampleLocations.survey_id, sampleLocation);
    });

    const sampleSiteRecords = await Promise.all(promises);

    const blockService = new SampleBlockService(this.connection);
    const stratumService = new SampleStratumService(this.connection);

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
   * TODO: This function awaits every db request, could parallelize similar requests (Promise.all) to improve
   * performance.
   *
   * @param {number} surveyId
   * @param {UpdateSampleLocationRecord} sampleSite
   * @memberof SampleSiteService
   */
  async updateSampleLocationMethodPeriod(surveyId: number, sampleSite: UpdateSampleLocationRecord) {
    const blockService = new SampleBlockService(this.connection);
    const stratumService = new SampleStratumService(this.connection);

    // Update the main sample location
    await this.sampleLocationRepository.updateSampleSite(surveyId, sampleSite);

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
  }
}
