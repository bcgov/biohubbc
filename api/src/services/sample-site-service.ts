import { Feature } from 'geojson';
import { SurveySampleSiteModel } from '../database-models/survey_sample_site';
import { IDBConnection } from '../database/db';
import { ISiteAdvancedFilters } from '../models/site-view';
import { UpdateSampleBlockRecord } from '../repositories/sample-blocks-repository';
import {
  FindSampleSiteRecord,
  InsertSampleSiteRecord,
  SampleSiteGeometryRecord,
  SampleSiteRecordExtended,
  SampleSiteRecordExtendedNonSpatial,
  SampleSiteRepository
} from '../repositories/sample-site-repository/sample-site-repository';
import { UpdateSampleStratumRecord } from '../repositories/sample-stratums-repository';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { SampleBlockService } from './sample-block-service';
import { SampleStratumService } from './sample-stratum-service';
import { SurveyBlockService } from './survey-block-service';
import { SurveyBlockRecord } from '../database-models/survey_block';
import { PostSurveyBlock } from '../repositories/survey-block-repository';

interface InsertSiteBlockAssignment {
  site_assignment_id: string;
  block_assignment_id: string;
}

interface InsertSiteStratumAssignment {
  site_assignment_id: string;
  stratum_assignment_id: string;
}

export interface CreateSampleSiteObject {
  survey_id: number;
  survey_sample_sites: InsertSampleSiteRecord[];
  blocks: PostSurveyBlock[];
  site_block_assignments: InsertSiteBlockAssignment[];
  site_stratum_assignments: InsertSiteStratumAssignment[];
}

/**
 * Update object for a sample site record, including all associated blocks and stratums.
 */
export interface UpdateSampleSiteObject {
  survey_sample_site_id: number;
  name: string;
  description: string;
  geojson: Feature;
  blocks: UpdateSampleBlockRecord[];
  stratums: UpdateSampleStratumRecord[];
}

const defaultLog = getLogger('services/sample-site-service');

/**
 * Sample Site Repository
 *
 * @export
 * @class SampleSiteService
 * @extends {DBService}
 */
export class SampleSiteService extends DBService {
  sampleSiteRepository: SampleSiteRepository;
  sampleBlockService: SampleBlockService;
  surveyBlockService: SurveyBlockService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleSiteRepository = new SampleSiteRepository(connection);
    this.sampleBlockService = new SampleBlockService(connection);
    this.surveyBlockService = new SurveyBlockService(connection);
  }

  /**
   * Gets a paginated set of survey Sample sites for the given survey.
   *
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       sampleSiteIds?: number[];
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*}  {Promise<SampleSiteRecordExtendedNonSpatial[]>}
   * @memberof SampleSiteService
   */
  async getSampleSitesForSurveyId(
    surveyId: number,
    options?: {
      keyword?: string;
      sampleSiteIds?: number[];
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SampleSiteRecordExtendedNonSpatial[]> {
    return this.sampleSiteRepository.getSampleSitesForSurveyId(surveyId, options);
  }

  /**
   * Returns the total count of sample sites belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteService
   */
  async getSampleSitesCountBySurveyId(surveyId: number): Promise<number> {
    return this.sampleSiteRepository.getSampleSitesCountBySurveyId(surveyId);
  }

  /**
   * Returns the geometry for all sampling sites in the Survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleSiteGeometryRecord[]>}
   * @memberof SampleSiteService
   */
  async getSampleSitesGeometryBySurveyId(surveyId: number): Promise<SampleSiteGeometryRecord[]> {
    return this.sampleSiteRepository.getSampleSitesGeometryBySurveyId(surveyId);
  }

  /**
   * Gets a sample site by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleSiteRecordExtended>}
   * @memberof SampleSiteService
   */
  async getSurveySampleSiteBySiteId(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecordExtended> {
    return this.sampleSiteRepository.getSurveySampleSiteBySiteId(surveyId, surveySampleSiteId);
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
    return this.sampleSiteRepository.findSites(isUserAdmin, systemUserId, filterFields, pagination);
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
    return this.sampleSiteRepository.findSitesCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Deletes a survey sample site record.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteService
   */
  async deleteSampleSiteRecord(surveyId: number, surveySampleSiteId: number): Promise<SurveySampleSiteModel> {
    const sampleBlockService = new SampleBlockService(this.connection);
    const sampleStratumService = new SampleStratumService(this.connection);

    // Delete all blocks associated with the sample site
    const existingSampleBlocks = await sampleBlockService.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

    await sampleBlockService.deleteSampleBlockRecords(existingSampleBlocks.map((item) => item.survey_sample_block_id));

    // Delete all stratums associated with a sample site
    const existingSampleStratums = await sampleStratumService.getSampleStratumsForSurveySampleSiteId(
      surveySampleSiteId
    );

    await sampleStratumService.deleteSampleStratumRecords(
      existingSampleStratums.map((item) => item.survey_sample_stratum_id)
    );

    // Lastly, delete the site itself
    return this.sampleSiteRepository.deleteSampleSiteRecord(surveyId, surveySampleSiteId);
  }

  /**
   * Creates survey sample sites and associated blocks and stratums.
   *
   * It is a business requirement to use strings from the properties field of provided geometry
   * to determine the name and description of sampling sites when possible.
   *
   * If there is no string contained in the fields 'name', 'label' to be used in our db,
   * the system will auto-generate a name of 'Sampling Site #x', where x is taken from the greatest value
   * integer id + 1 in the db.
   *
   * @param {CreateSampleSiteObject} sampleSites
   * @return {*}  {Promise<SurveySampleSiteModel[]>}
   * @memberof SampleSiteService
   */
  async createSampleSite(sampleSites: CreateSampleSiteObject): Promise<SurveySampleSiteModel[]> {
    defaultLog.debug({ label: 'createSampleSite' });

    // Create a sample site record for each feature found
    const promises = sampleSites.survey_sample_sites.map((sampleSite) => {
      return this.sampleSiteRepository.insertSampleSite(sampleSites.survey_id, sampleSite);
    });

    const sampleSiteRecords = await Promise.all(promises);

    const blockService = new SampleBlockService(this.connection);
    // const stratumService = new SampleStratumService(this.connection);

    // Loop through all newly created sample sites
    // For reach sample site, create associated sample blocks
    const blockPromises = sampleSiteRecords.map((sampleSiteRecord) =>
      sampleSites.blocks.map((item) => {
        if (!item.survey_block_id) {
          return;
        }

        const sampleBlock = {
          survey_sample_site_id: sampleSiteRecord.survey_sample_site_id,
          survey_block_id: item.survey_block_id
        };
        return blockService.insertSampleBlock(sampleBlock);
      })
    );

    // // Loop through all newly created sample sites
    // // For reach sample site, create associated sample stratums
    // const stratumPromises = sampleSiteRecords.map((sampleSiteRecord) =>
    //   sampleSites.stratums.map((item) => {
    //     const sampleStratum = {
    //       survey_sample_site_id: sampleSiteRecord.survey_sample_site_id,
    //       survey_stratum_id: item.survey_stratum_id
    //     };
    //     return stratumService.insertSampleStratum(sampleStratum);
    //   })
    // );
    const stratumPromises: any[] = [];

    await Promise.all([...blockPromises, ...stratumPromises]);

    return sampleSiteRecords;
  }
  /**
   * Creates survey sample sites and associated blocks and stratums.
   *
   * @param {CreateSampleSiteObject} data - The data for sample sites, blocks, and assignments.
   * @return {Promise<SurveySampleSiteModel[]>} - A promise that resolves to an array of created survey sample sites.
   * @memberof SampleSiteService
   */
  async createSampleSitesAndBlocks(data: CreateSampleSiteObject): Promise<SurveySampleSiteModel[]> {
    defaultLog.debug({ label: 'createSampleSite' });

    // Step 1: Insert the sampling sites and store the mapping between site_assignment_id and inserted site.
    const siteAssignmentsMap = new Map<string, SurveySampleSiteModel>();
    const sitePromises = data.survey_sample_sites.map(async (site) => {
      const insertedSite = await this.sampleSiteRepository.insertSampleSite(data.survey_id, site);
      siteAssignmentsMap.set(site.site_assignment_id, insertedSite);
    });

    // Step 2: Insert each survey block and store the mapping between block_assignment_id and survey_block_id.
    const blockAssignmentsMap = new Map<string, SurveyBlockRecord>();
    const blockPromises = data.blocks.map(async (block) => {
      const insertedBlock = await this.surveyBlockService.insertSurveyBlocks(data.survey_id, [block]);
      if (block.assignment_id) {
        blockAssignmentsMap.set(block.assignment_id, insertedBlock[0]);
      }
    });

    // Step 3: Wait for both site and block insertions to complete in parallel.
    await Promise.all([sitePromises, blockPromises]);

    // Step 4: Join sampling sites to survey blocks by inserting site-block assignments.
    const assignmentPromises = data.site_block_assignments.map(async (assignment) => {
      const site = siteAssignmentsMap.get(assignment.site_assignment_id);
      const block = blockAssignmentsMap.get(assignment.block_assignment_id);

      if (site && block) {
        await this.sampleBlockService.insertSampleBlock({
          survey_block_id: block.survey_block_id,
          survey_sample_site_id: site.survey_sample_site_id
        });
      }
    });

    // Step 5: Wait for all site-block assignments to be inserted
    await Promise.all(assignmentPromises);

    // Optionally, return the created sites if needed
    return [...siteAssignmentsMap.values()];
  }

  /**
   * Updates a survey sample site record and associated blocks and stratums.
   *
   * @param {number} surveyId
   * @param {UpdateSampleSiteObject} sampleSite
   * @memberof SampleSiteService
   */
  async updateSampleSite(surveyId: number, sampleSite: UpdateSampleSiteObject) {
    const blockService = new SampleBlockService(this.connection);
    const stratumService = new SampleStratumService(this.connection);

    await Promise.all([
      // Update the sample site record
      this.sampleSiteRepository.updateSampleSite(surveyId, sampleSite),
      // Delete any block records that are not in the incoming array
      blockService.deleteSampleBlocksNotInArray(sampleSite.survey_sample_site_id, sampleSite.blocks),
      // Delete any stratum records that are not in the incoming array
      stratumService.deleteSampleStratumsNotInArray(sampleSite.survey_sample_site_id, sampleSite.stratums)
    ]);

    // Loop through all blocks and create the ones that have no survey_sample_block_id (indicating they are new)
    for (const item of sampleSite.blocks) {
      if (!item.survey_sample_block_id) {
        const sampleBlock = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          survey_block_id: item.survey_block_id
        };

        await blockService.insertSampleBlock(sampleBlock);
      }
    }

    // Loop through all stratums and create the ones that have no survey_sample_stratum_id (indicating they are new)
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
