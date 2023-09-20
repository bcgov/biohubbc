import { IDBConnection } from '../database/db';
import {
  PostSampleLocation,
  PostSampleLocations,
  SampleLocationRecord,
  SampleLocationRepository
} from '../repositories/sample-location-repository';
import { DBService } from './db-service';

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
   * Gets all survey Sample Locations.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationService
   */
  async getSampleLocationsForSurveyId(surveyId: number): Promise<SampleLocationRecord[]> {
    return await this.sampleLocationRepository.getSampleLocationsForSurveyId(surveyId);
  }

  /**
   * Deletes a survey Sample Location.
   *
   * @param {number} sampleLocationId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async deleteSampleLocationRecord(sampleLocationId: number): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.deleteSampleLocationRecord(sampleLocationId);
  }

  /**
   * Inserts survey Sample Locations.
   *
   * @param {PostSampleLocations} sampleLocations
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationService
   */
  async insertSampleLocations(sampleLocations: PostSampleLocations): Promise<SampleLocationRecord[]> {
    const promises = sampleLocations.survey_sample_sites.features.map((feature) => {
      const sampleLocation: PostSampleLocation = {
        survey_sample_site_id: null,
        survey_id: sampleLocations.survey_id,
        name: sampleLocations.name,
        description: sampleLocations.description,
        survey_sample_site: feature
      };

      return this.sampleLocationRepository.insertSampleLocation(sampleLocation);
    });

    const results = await Promise.all(promises);
    return results;
  }

  /**
   * updates a survey Sample Location.
   *
   * @param {PostSampleLocation} sampleLocation
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async updateSampleLocation(sampleLocation: PostSampleLocation): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.updateSampleLocation(sampleLocation);
  }
}
