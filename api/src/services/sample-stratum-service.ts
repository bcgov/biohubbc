import { IDBConnection } from '../database/db';
import {
  InsertSampleStratumRecord,
  SampleStratumRecord,
  SampleStratumRepository,
  UpdateSampleStratumRecord
} from '../repositories/sample-stratums-repository';
import { DBService } from './db-service';

// export interface PostSampleStratum {
//   survey_id: number;
//   survey_sample_site_id: number;
//   survey_stratum_id: number;
// }

/**
 * Sample Stratum Repository
 *
 * @export
 * @class SampleStratumService
 * @extends {DBService}
 */
export class SampleStratumService extends DBService {
  sampleStratumRepository: SampleStratumRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleStratumRepository = new SampleStratumRepository(connection);
  }

  /**
   * Gets all survey Sample Stratums.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof SampleStratumService
   */
  async getSampleStratumsForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleStratumRecord[]> {
    return await this.sampleStratumRepository.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);
  }

  /**
   * Gets all survey Sample Stratums for a given Survey Stratum
   *
   * @param {number} surveySampleStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof SampleStratumService
   */
  async getSampleStratumsForSurveyStratumId(surveyStratumId: number): Promise<SampleStratumRecord[]> {
    return await this.sampleStratumRepository.getSampleStratumsForSurveyStratumId(surveyStratumId);
  }

  /**
   * Gets count of all survey Sample Stratums for a given Survey Stratum
   *
   * @param {number} surveySampleStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof SampleStratumService
   */
  async getSampleStratumsCountForSurveyStratumId(surveyStratumId: number): Promise<{ sampleCount: number }> {
    return await this.sampleStratumRepository.getSampleStratumsCountForSurveyStratumId(surveyStratumId);
  }

  /**
   * Deletes a survey Sample Stratum.
   *
   * @param {number} surveySampleStratumId
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async deleteSampleStratumRecord(surveySampleStratumId: number): Promise<SampleStratumRecord> {
    return await this.sampleStratumRepository.deleteSampleStratumRecord(surveySampleStratumId);
  }

  /**
   * Inserts survey Sample Stratum
   *
   * @param {InsertSampleStratumRecord} sampleStratum
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async insertSampleStratum(sampleStratum: InsertSampleStratumRecord): Promise<SampleStratumRecord> {
    return await this.sampleStratumRepository.insertSampleStratum(sampleStratum);
  }

  /**
   * Fetches and compares any existing sample stratums for a given sample site id.
   * Any sample stratums not found in the given array will be deleted.
   *
   * @param {number} surveySampleSiteId
   * @param {UpdateSampleStratumRecord[]} newStratums
   * @memberof SampleStratumService
   */
  async deleteSampleStratumsNotInArray(surveySampleSiteId: number, newStratums: UpdateSampleStratumRecord[]) {
    //Get any existing stratums for the sample site
    const existingStratums = await this.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);

    // Compare input and existing for stratums to delete
    // Any existing stratums that are not found in the new stratums being passed in will be collected for deletion
    const existingStratumsToDelete = existingStratums.filter((existingStratum) => {
      return !newStratums.find(
        (incomingStratum) => incomingStratum.survey_sample_stratum_id === existingStratum.survey_sample_stratum_id
      );
    });

    // Delete any stratums not found in the passed in array
    if (existingStratumsToDelete.length > 0) {
      const promises: Promise<any>[] = [];

      // Check if any observations are associated with the stratums to be deleted
      for (const stratum of existingStratumsToDelete) {
        promises.push(this.deleteSampleStratumRecord(stratum.survey_sample_stratum_id));
      }

      await Promise.all(promises);
    }
  }

  /**
   * updates a survey Sample stratum.
   *
   * @param {InsertSampleStratumRecord} sampleStratum
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async updateSampleStratum(sampleStratum: UpdateSampleStratumRecord): Promise<SampleStratumRecord> {
    // const samplePeriodService = new SamplePeriodService(this.connection);
    const sampleStratumService = new SampleStratumService(this.connection);

    // // Check for any sample periods to delete
    // await samplePeriodService.deleteSamplePeriodsNotInArray(sampleStratum.survey_sample_stratum_id, sampleStratum.periods);

    // Loop through all new sample periods
    // For each sample period, check if it exists in the existing list
    // If it does, update it, otherwise create it

    if (sampleStratum.survey_sample_stratum_id) {
      const result = await this.sampleStratumRepository.updateSampleStratum(sampleStratum);
      console.log(result);
      return result;
    } else {
      const result = await sampleStratumService.insertSampleStratum(sampleStratum);
      console.log(result);
      return result;
    }
  }
}
