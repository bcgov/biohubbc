import { Feature } from '@turf/helpers';
import { IDBConnection } from '../database/db';
import {
  SampleLocationRecord,
  SampleLocationRepository,
  UpdateSampleSiteRecord,
  UpdateSampleSitesRecord
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

    // Create a sample location for each feature found
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
   * updates a survey Sample Location.
   *
   * @param {PostSampleLocation} sampleLocation
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async updateSampleSites(sampleLocations: UpdateSampleSitesRecord) {
    console.log('sampleLocations', sampleLocations);

    // Create a sample location for each feature found
    const promises = sampleLocations.survey_sample_sites.map((item, index) => {
      if (index === 0) {
        //first index is the main sample location
        const sampleSite = {
          survey_sample_site_id: sampleLocations.survey_sample_site_id,
          survey_id: sampleLocations.survey_id,
          name: sampleLocations.name,
          description: sampleLocations.description,
          geojson: item,
          methods: sampleLocations.methods
        };
        console.log('UPDATE sampleSite', sampleSite);

        return this.updateSampleLocationMethodPeriod(sampleSite);
      } else {
        // all other indexes are new sample locations
        const sampleSite = {
          survey_sample_site_id: null,
          survey_id: sampleLocations.survey_id,
          name: `${sampleLocations.name}-${index}`, // Business requirement to default the names to Sample Site # on creation
          description: sampleLocations.description,
          survey_sample_sites: [(item as unknown) as Feature],
          methods: sampleLocations.methods
        };
        console.log('INSERT sampleSite', sampleSite);

        return this.insertSampleLocations(sampleSite);
      }
    });

    return Promise.all(promises);
  }

  async updateSampleLocationMethodPeriod(sampleSite: UpdateSampleSiteRecord) {
    console.log('sampleSite', sampleSite);
    const methodService = new SampleMethodService(this.connection);

    // Update the main sample location
    await this.sampleLocationRepository.updateSampleLocation(sampleSite);

    // Check for methods to delete
    await methodService.checkSampleMethodsToDelete(sampleSite.survey_sample_site_id, sampleSite.methods);

    // Loop through all methods
    // For each method, check if it exists
    // If it exists, update it
    // If it does not exist, create it
    const methodPromises = sampleSite.methods.map((item) => {
      if (item.survey_sample_method_id) {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          survey_sample_method_id: item.survey_sample_method_id,
          method_lookup_id: item.method_lookup_id,
          description: item.description,
          periods: item.periods
        };
        console.log('UPDATE sampleMethod', sampleMethod);
        return methodService.updateSampleMethod(sampleMethod);
      } else {
        const sampleMethod = {
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          method_lookup_id: item.method_lookup_id,
          description: item.description,
          periods: item.periods
        };
        console.log('INSERT sampleMethod', sampleMethod);

        return methodService.insertSampleMethod(sampleMethod);
      }
    });

    await Promise.all(methodPromises);
  }
}
