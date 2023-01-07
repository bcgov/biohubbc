import { IDBConnection } from '../database/db';
import { IOccurrenceSubmission, OccurrenceRepository } from '../repositories/occurrence-repository';
import { DBService } from './db-service';

export class OccurrenceService extends DBService {
  occurrenceRepository: OccurrenceRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.occurrenceRepository = new OccurrenceRepository(connection);
  }

  /**
   *  Gets a `occurrence_submission` for an id.
   *
   * @param {number} submissionId
   * @return {*} {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission> {
    return this.occurrenceRepository.getOccurrenceSubmission(submissionId);
  }

  /**
   * Gets list `occurrence` and maps them for use on a map
   *
   * @param {number} submissionId
   * @return {*} {Promise<any[]>}
   */
  async getOccurrences(submissionId: number): Promise<any[]> {
    const occurrenceData = await this.occurrenceRepository.getOccurrencesForView(submissionId);
    return occurrenceData.map((occurrence) => {
      const feature =
        (occurrence.geometry && { type: 'Feature', geometry: JSON.parse(occurrence.geometry), properties: {} }) || null;

      return {
        geometry: feature,
        taxonId: occurrence.taxonid,
        occurrenceId: occurrence.occurrence_id,
        individualCount: Number(occurrence.individualcount),
        lifeStage: occurrence.lifestage,
        sex: occurrence.sex,
        organismQuantity: Number(occurrence.organismquantity),
        organismQuantityType: occurrence.organismquantitytype,
        vernacularName: occurrence.vernacularname,
        eventDate: occurrence.eventdate
      };
    });
  }

  /**
   * Updates `occurrence_submission` output key field.
   *
   * @param {number} submissionId
   * @param {string} fileName
   * @param {string} key
   * @return {*} {Promise<any>}
   */
  async updateSurveyOccurrenceSubmission(submissionId: number, fileName: string, key: string): Promise<any> {
    return this.occurrenceRepository.updateSurveyOccurrenceSubmissionWithOutputKey(submissionId, fileName, key);
  }

  /**
   * Updates `darwin_core_source` with passed a stringified json object.
   *
   * @param {number} submissionId
   * @param {string} jsonData
   * @return {*} {Promise<number>}
   */
  async updateDWCSourceForOccurrenceSubmission(submissionId: number, jsonData: string): Promise<number> {
    return await this.occurrenceRepository.updateDWCSourceForOccurrenceSubmission(submissionId, jsonData);
  }
}
