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
    return this.sampleStratumRepository.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);
  }

  /**
   * Gets all survey Sample Stratums for a given Survey Stratum
   *
   * @param {number} surveyStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof SampleStratumService
   */
  async getSampleStratumsForSurveyStratumId(surveyStratumId: number): Promise<SampleStratumRecord[]> {
    return this.sampleStratumRepository.getSampleStratumsForSurveyStratumId(surveyStratumId);
  }

  /**
   * Gets count of all survey Sample Stratums for a given Survey Stratum
   *
   * @param {number} surveyStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof SampleStratumService
   */
  async getSampleStratumsCountForSurveyStratumId(surveyStratumId: number): Promise<number> {
    return this.sampleStratumRepository.getSampleStratumsCountForSurveyStratumId(surveyStratumId);
  }

  /**
   * Deletes all associations between a given Survey Stratum and any sampling site
   *
   * @param {number} surveyStratumIds
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async deleteSampleStratumRecordsByStratumIds(surveyStratumIds: number[]): Promise<SampleStratumRecord[]> {
    return this.sampleStratumRepository.deleteSampleStratumRecordsByStratumIds(surveyStratumIds);
  }

  /**
   * Deletes specific Survey Sample Stratum records, removing the assignment of a Survey Stratum to a Sample Site
   *
   * @param {number} surveySampleStratumIds
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async deleteSampleStratumRecords(surveySampleStratumIds: number[]): Promise<SampleStratumRecord[]> {
    return this.sampleStratumRepository.deleteSampleStratumRecords(surveySampleStratumIds);
  }

  /**
   * Inserts survey Sample Stratum
   *
   * @param {InsertSampleStratumRecord} sampleStratum
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof SampleStratumService
   */
  async insertSampleStratum(sampleStratum: InsertSampleStratumRecord): Promise<SampleStratumRecord> {
    return this.sampleStratumRepository.insertSampleStratum(sampleStratum);
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
    const existingStratumsToDelete = existingStratums
      .filter((existingStratum) => {
        return !newStratums.find(
          (incomingStratum) => incomingStratum.survey_sample_stratum_id === existingStratum.survey_sample_stratum_id
        );
      })
      .map((item) => item.survey_sample_stratum_id);

    // Delete any stratums not found in the passed in array
    if (existingStratumsToDelete.length > 0) {
      await this.deleteSampleStratumRecords(existingStratumsToDelete);
    }
  }
}
