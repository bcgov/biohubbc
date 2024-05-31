import { Feature } from 'geojson';
import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository, REGION_FEATURE_CODE } from '../repositories/region-repository';
import { BcgwLayerService, RegionDetails } from './bcgw-layer-service';
import { DBService } from './db-service';

export class RegionService extends DBService {
  regionRepository: RegionRepository;
  bcgwLayerService: BcgwLayerService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.regionRepository = new RegionRepository(connection);
    this.bcgwLayerService = new BcgwLayerService();
  }

  /**
   * Adds NRM regions to a given survey based on a list of features,
   * business requires all features to be mapped to an intersecting NRM regions.
   * Note: This method will delete all regions in the survey before adding the new regions.
   *
   * @param {number} surveyId
   * @param {Feature[]} features
   * @returns {Promise<void>}
   */
  async insertRegionsIntoSurveyFromFeatures(surveyId: number, features: Feature[]): Promise<void> {
    // Find intersecting NRM regions from list of features
    const regions = await this.regionRepository.getIntersectingRegionsFromFeatures(
      features,
      REGION_FEATURE_CODE.NATURAL_RESOURCE_REGION // Optional filter
    );

    const regionIds = regions.map((region) => region.region_id);

    // Delete the previous regions and insert new
    await this.refreshSurveyRegions(surveyId, regionIds);
  }

  /**
   * Gets a unique list of region details for a given list of features
   *
   * @param {Feature[]} features
   * @returns {*} {Promise<RegionDetails[]>}
   */
  async getUniqueRegionsForFeatures(features: Feature[]): Promise<RegionDetails[]> {
    return this.bcgwLayerService.getUniqueRegionsForFeatures(features, this.connection);
  }

  /**
   * Links a given survey to a list of regions.
   * To avoid conflict all regions of the survey are removed before regions are re-inserted.
   * Why? Regions are not currently added via a UI select control, instead they are inferred from the
   * `Survey Study Area Map`. The regions should be an exhaustive list of what was included on the map.
   *
   * @param {number} surveyId
   * @param {number[]} regionIds - region lookup ids
   * @returns {Promise<void>}
   */
  async refreshSurveyRegions(surveyId: number, regionIds: number[]): Promise<void> {
    // remove existing regions from the survey
    await this.regionRepository.deleteRegionsForSurvey(surveyId);

    // add regions back to survey
    await this.regionRepository.addRegionsToSurvey(surveyId, regionIds);
  }

  /**
   * Searches for regions based on a given list of `RegionDetails`
   *
   * @param {RegionDetails[]} details
   * @returns {*} {Promise<IRegion[]>}
   */
  async searchRegionWithDetails(details: RegionDetails[]): Promise<IRegion[]> {
    return this.regionRepository.searchRegionsWithDetails(details);
  }
}
