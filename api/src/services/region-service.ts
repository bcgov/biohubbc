import { IDBConnection } from '../database/db';
import { IRegion, RegionRepository } from '../repositories/region-repository';
import { DBService } from './db-service';

export class RegionService extends DBService {
  regionRepository: RegionRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.regionRepository = new RegionRepository(connection);
  }
  async addRegionsToProject(projectId: number, regions: number[]): Promise<void> {
    await this.regionRepository.addRegionsToAProject(projectId, regions);
  }
  async addRegionsToSurvey(surveyId: number, regions: number[]): Promise<void> {
    await this.regionRepository.addRegionsToASurvey(surveyId, regions);
  }
  async getAllRegions(): Promise<IRegion[]> {
    return await this.regionRepository.getAllRegions();
  }

  async searchRegionsWithGeography(): Promise<IRegion[]> {
    return await this.regionRepository.searchRegionsWithGeography();
  }
}
