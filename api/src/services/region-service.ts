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

  async addRegionsToProjectFromFeatures(projectId: number, features: Feature[]): Promise<void> {
    const regionDetails = await this.getUniqueRegionsForFeatures(features);
    const regions: IRegion[] = await this.searchRegionWithDetails(regionDetails);

    await this.addRegionsToProject(projectId, regions);
  }

  async addRegionsToSurveyFromFeatures(surveyId: number, features: Feature[]): Promise<void> {
    const regionDetails = await this.getUniqueRegionsForFeatures(features);
    const regions: IRegion[] = await this.searchRegionWithDetails(regionDetails);

    await this.addRegionsToSurvey(surveyId, regions);
  }

  async addRegionsToProject(projectId: number, regions: IRegion[]): Promise<void> {
    // remove existing regions from a project
    this.regionRepository.deleteRegionsFromAProject(projectId);

    const regionIds = regions.map((item) => item.region_id);
    await this.regionRepository.addRegionsToAProject(projectId, regionIds);
  }

  async getUniqueRegionsForFeatures(features: Feature[]): Promise<RegionDetails[]> {
    const bcgwService = new BcgwLayerService();
    return await bcgwService.getUniqueRegionsForFeatures(features, this.connection);
  }

  async addRegionsToSurvey(surveyId: number, regions: IRegion[]): Promise<void> {
    // remove existing regions from a survey
    this.regionRepository.deleteRegionsFromASurvey(surveyId);

    const regionIds = regions.map((item) => item.region_id);
    await this.regionRepository.addRegionsToASurvey(surveyId, regionIds);
  }
  async getAllRegions(): Promise<IRegion[]> {
    return await this.regionRepository.getAllRegions();
  }

  async getRegionsForProject(projectId: number): Promise<IRegion[]> {
    return await this.regionRepository.getRegionsForProjectId(projectId);
  }

  async searchRegionWithDetails(details: RegionDetails[]): Promise<IRegion[]> {
    return await this.regionRepository.searchRegionsWithDetails(details);
  }
}
