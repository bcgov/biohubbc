import { Feature } from 'geojson';
import { flatten } from 'lodash';
import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository } from '../repositories/region-repository';
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
   * Adds regions to a given survey based on a list of features.
   * This function will first find a unique list of region details and use that list of details
   * to search the region lookup table for corresponding regions, then links regions to the survey
   *
   * @param {number} surveyId
   * @param {Feature[]} features
   */
  async addRegionsToSurveyFromFeatures(surveyId: number, features: Feature[]): Promise<void> {
    // Bind 'this' from bcgwLayserService so method can be passed correctly to getBcgwRegionsForFeature
    const getNrmRegionDetails = this.bcgwLayerService.getNrmRegionDetails.bind(this.bcgwLayerService);

    // Generate list of RegionDetails[] promises
    const regionPromises = features.map((feature) =>
      this.bcgwLayerService.getBcgwRegionsForFeature(feature, getNrmRegionDetails, this.connection)
    );

    // Flatten the RegionDetails[] into a single list
    const flattenedRegions = flatten(await Promise.all(regionPromises));

    // Remove duplicates
    const uniqueRegionDetails = Array.from(new Set(flattenedRegions));

    // Search for matching regions in the regions_lookup table
    const regions = await this.searchRegionWithDetails(uniqueRegionDetails);

    console.log({ uniqueRegionDetails, regionsToInsert: regions });

    // Add the regions to the survey
    await this.addRegionsToSurvey(surveyId, regions);
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
   * Links a given survey to a list of given regions. To avoid conflict
   * all currently linked regions are removed before regions are linked
   *
   * @param {number} surveyId
   * @param {IRegion[]} regions
   */
  async addRegionsToSurvey(surveyId: number, regions: IRegion[]): Promise<void> {
    // remove existing regions from a survey
    await this.regionRepository.deleteRegionsForSurvey(surveyId);

    const regionIds = regions.map((item) => item.region_id);
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
