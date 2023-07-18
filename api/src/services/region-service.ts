import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository } from '../repositories/region-repository';
import { RegionDetails } from './bcgw-layer-service';
import { DBService } from './db-service';

export class RegionService extends DBService {
  regionRepository: RegionRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.regionRepository = new RegionRepository(connection);
  }
  async addRegionsToProject(projectId: number, regions: IRegion[]): Promise<void> {
    const regionIds = regions.map((item) => item.region_id);
    await this.regionRepository.addRegionsToAProject(projectId, regionIds);
  }
  async addRegionsToSurvey(surveyId: number, regions: number[]): Promise<void> {
    await this.regionRepository.addRegionsToASurvey(surveyId, regions);
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
