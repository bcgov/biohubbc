import { Feature } from 'geojson';
import { flatten } from 'lodash';
import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository } from '../repositories/region-repository';
import { BcgwLayerService, RegionDetails } from './bcgw-layer-service';
import { DBService } from './db-service';
import { Srid3005 } from './geo-service';
import { PostgisService } from './postgis-service';

export class RegionService extends DBService {
  regionRepository: RegionRepository;
  bcgwLayerService: BcgwLayerService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.regionRepository = new RegionRepository(connection);
    this.bcgwLayerService = new BcgwLayerService();
  }

  /**
   * Adds NRM regions to a given survey based on a list of features.
   * Business requires all features to be mapped to intersecting NRM regions.
   *
   * @param {number} surveyId
   * @param {Feature[]} features
   */
  async addRegionsToSurveyFromFeatures(surveyId: number, features: Feature[]): Promise<void> {
    const postgisService = new PostgisService(this.connection);

    // Generate list of PostGIS geometry strings
    const geometryWKTStringArr = await Promise.all(
      features.map((feature) => postgisService.getGeoJsonGeometryAsWkt(feature.geometry, Srid3005))
    );

    // Get NRM region details from PostGIS geometry strings
    const nrmRegionDetailsPromises = await Promise.all(
      geometryWKTStringArr.map((geometryString) => this.bcgwLayerService.getNrmRegionDetails(geometryString))
    );

    // Flatten the RegionDetails[][] into a single list -> RegionDetails[]
    const flattenedRegions = flatten(await Promise.all(nrmRegionDetailsPromises));

    // Remove duplicates
    const uniqueRegionDetails = Array.from(new Set(flattenedRegions));

    // Search for matching regions in the regions_lookup table
    const regions = await this.getRegionsByNames(uniqueRegionDetails.map((regionDetail) => regionDetail.regionName));

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

  /**
   * Searches for regions based on a given list of `RegionDetails`
   *
   * @param {string[]} regionNames - Names of regions
   * @returns {IRegion[]} - List of regions
   */
  async getRegionsByNames(regionNames: string[]): Promise<IRegion[]> {
    return this.regionRepository.getRegionsByNames(regionNames);
  }
}
