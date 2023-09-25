import { Feature } from '@turf/helpers';
import { IDBConnection } from '../database/db';
import {
  SampleLocationRecord,
  SampleLocationRepository,
  UpdateSampleLocationRecord
} from '../repositories/sample-location-repository';
import { InsertSampleMethod } from '../repositories/sample-method-repository';
import { DBService } from './db-service';
import { SampleMethodService } from './sample-method-service';

export interface PostSampleLocations {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  survey_sample_sites: Feature[];
  methods: InsertSampleMethod[];
}
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
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async deleteSampleLocationRecord(surveySampleSiteId: number): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.deleteSampleLocationRecord(surveySampleSiteId);
  }

  /**
   * Inserts survey Sample Locations.
   *
   * @param {PostSampleLocations} sampleLocations
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationService
   */
  async insertSampleLocations(sampleLocations: PostSampleLocations): Promise<SampleLocationRecord[]> {
    const methodService = new SampleMethodService(this.connection);

    const promises = sampleLocations.survey_sample_sites.map((item, index) => {
      const sampleLocation = {
        survey_id: sampleLocations.survey_id,
        name: `Sample Site ${index + 1}`, // Business requirement to default the names to Sample Site # on creation
        description: sampleLocations.description,
        geojson: item
      };

      return this.sampleLocationRepository.insertSampleLocation(sampleLocation);
    });
    const results = await Promise.all<SampleLocationRecord>(promises);

    const methodPromises = results.map((sampleSite: SampleLocationRecord) =>
      sampleLocations.methods.map((item) => {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          method_lookup_id: item.method_lookup_id,
          description: item.description,
          periods: item.periods
        };
        return methodService.insertSampleMethod(sampleMethod);
      })
    );
    await Promise.all(methodPromises);

    return results;
  }

  /**
   * updates a survey Sample Location.
   *
   * @param {PostSampleLocation} sampleLocation
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async updateSampleLocation(sampleLocation: UpdateSampleLocationRecord): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.updateSampleLocation(sampleLocation);
  }
}
