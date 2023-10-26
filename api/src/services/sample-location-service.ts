import { Feature, Geometry, GeometryCollection, Properties } from '@turf/helpers';
import { IDBConnection } from '../database/db';
import {
  SampleLocationRecord,
  SampleLocationRepository,
  UpdateSampleSiteRecord
} from '../repositories/sample-location-repository';
import { InsertSampleMethodRecord } from '../repositories/sample-method-repository';
import { DBService } from './db-service';
import { SampleMethodService } from './sample-method-service';

export interface PostSampleLocations {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  survey_sample_sites: Feature[];
  methods: InsertSampleMethodRecord[];
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
    const determineName = (geometry: Feature<Geometry | GeometryCollection, Properties>) => {
      const nameKey = Object.keys(geometry.properties ?? {}).find(
        (key) => key.toLowerCase() === 'name' || key.toLowerCase() === 'label'
      );
      return nameKey && geometry.properties ? geometry.properties[nameKey].substring(0, 50) : '';
    };
    const determineDesc = (geometry: Feature<Geometry | GeometryCollection, Properties>) => {
      const descKey = Object.keys(geometry.properties ?? {}).find(
        (key) => key.toLowerCase() === 'desc' || key.toLowerCase() === 'description'
      );
      return descKey && geometry.properties ? geometry.properties[descKey].substring(0, 250) : '';
    };
    // Create a sample location for each feature found
    const promises = sampleLocations.survey_sample_sites.map((item) => {
      const sampleLocation = {
        survey_id: sampleLocations.survey_id,
        name: determineName(item), // Please note that additional logic for this also happens in insertSampleLocation below
        description: determineDesc(item) || sampleLocations.description,
        geojson: item
      };

      return this.sampleLocationRepository.insertSampleLocation(sampleLocation);
    });
    const results = await Promise.all<SampleLocationRecord>(promises);

    // Loop through all newly reaction sample locations
    // For reach sample location, create methods and associated with sample location id
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
   * Updates a survey entire Sample Site Record, with Location and associated methods and periods.
   *
   * @param {UpdateSampleSiteRecord} sampleSite
   * @memberof SampleLocationService
   */
  async updateSampleLocationMethodPeriod(sampleSite: UpdateSampleSiteRecord) {
    const methodService = new SampleMethodService(this.connection);

    // Update the main sample location
    await this.sampleLocationRepository.updateSampleLocation(sampleSite);

    // Check for methods to delete
    await methodService.deleteSampleMethodsNotInArray(sampleSite.survey_sample_site_id, sampleSite.methods);

    // Loop through all methods
    // For each method, check if it exists
    // If it exists, update it
    // If it does not exist, create it
    for (const item of sampleSite.methods) {
      if (item.survey_sample_method_id) {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          survey_sample_method_id: item.survey_sample_method_id,
          method_lookup_id: item.method_lookup_id,
          description: item.description,
          periods: item.periods
        };
        await methodService.updateSampleMethod(sampleMethod);
      } else {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          method_lookup_id: item.method_lookup_id,
          description: item.description,
          periods: item.periods
        };
        await methodService.insertSampleMethod(sampleMethod);
      }
    }
  }
}
