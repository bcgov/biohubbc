import { Feature } from 'geojson';
import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository } from '../repositories/region-repository';
import { BcgwLayerService, RegionDetails } from './bcgw-layer-service';
import { DBService } from './db-service';

export class RegionService extends DBService {
  regionRepository: RegionRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.regionRepository = new RegionRepository(connection);
  }

  /**
   * Adds regions to a given project based on a list of features.
   * This function will fist find a unique list of region details and use that list of details
   * to search the region lookup table for corresponding regions, then links regions to the project
   *
   * @param {number} projectId
   * @param {Feature[]} features
   */
  async addRegionsToProjectFromFeatures(projectId: number, features: Feature[]): Promise<void> {
    const regionDetails = await this.getUniqueRegionsForFeatures(features);
    const regions: IRegion[] = await this.searchRegionWithDetails(regionDetails);

    await this.addRegionsToProject(projectId, regions);
  }

  /**
   * Adds regions to a given survey based on a list of features.
   * This function will fist find a unique list of region details and use that list of details
   * to search the region lookup table for corresponding regions, then links regions to the survey
   *
   * @param {number} surveyId
   * @param {Feature[]} features
   */
  async addRegionsToSurveyFromFeatures(surveyId: number, features: Feature[]): Promise<void> {
    const regionDetails = await this.getUniqueRegionsForFeatures(features);
    const regions: IRegion[] = await this.searchRegionWithDetails(regionDetails);

    await this.addRegionsToSurvey(surveyId, regions);
  }

  /**
   * Links a given project to a list of given regions. To avoid conflict
   * all currently linked regions are removed before regions are linked
   *
   * @param {number} projectId
   * @param {IRegion[]} regions
   */
  async addRegionsToProject(projectId: number, regions: IRegion[]): Promise<void> {
    // remove existing regions from a project
    this.regionRepository.deleteRegionsFromAProject(projectId);

    const regionIds = regions.map((item) => item.region_id);
    await this.regionRepository.addRegionsToAProject(projectId, regionIds);
  }

  /**
   * Gets a unique list of region details for a given list of features
   *
   * @param {Feature[]} features
   * @returns {*} {Promise<RegionDetails[]>}
   */
  async getUniqueRegionsForFeatures(features: Feature[]): Promise<RegionDetails[]> {
    const bcgwService = new BcgwLayerService();
    return await bcgwService.getUniqueRegionsForFeatures(features, this.connection);
  }

  /**
   * Links a given survey to a list of given regions. To avoid conflict
   * all currently linked regions are removed before regions are linked
   *
   * @param {number} surveyId
   * @param {IRegion[]} regions
   */
  async addRegionsToSurvey(surveyId: number, regions: IRegion[]): Promise<void> {
    // remove existing regions from a survey
    this.regionRepository.deleteRegionsFromASurvey(surveyId);

    const regionIds = regions.map((item) => item.region_id);
    await this.regionRepository.addRegionsToASurvey(surveyId, regionIds);
  }

  /**
   * Searches for regions based on a given list of `RegionDetails`
   *
   * @param {RegionDetails[]} details
   * @returns {*} {Promise<IRegion[]>}
   */
  async searchRegionWithDetails(details: RegionDetails[]): Promise<IRegion[]> {
    return await this.regionRepository.searchRegionsWithDetails(details);
  }
}
