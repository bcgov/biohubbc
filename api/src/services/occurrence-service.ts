import { GeoJsonProperties } from 'geojson';
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
    const response = await this.occurrenceRepository.getOccurrencesForView(submissionId);

    const occurrenceData = response.map((row) => {
      const { spatial_component, taxa_data } = row;
      const { spatial_data, ...rest } = spatial_component;
      return {
        taxa_data,
        ...rest,
        spatial_data: {
          ...spatial_data,
          features: spatial_data.features.map((feature) => {
            delete feature?.properties?.dwc;
            return feature;
          })
        }
      };
    });

    return occurrenceData;
  }

  /**
   * Updates `occurrence_submission` output key field.
   *
   * @param {number} submissionId
   * @param {string} fileName
   * @param {string} key
   * @return {*} {Promise<any>}
   */
  async updateSurveyOccurrenceSubmissionWithOutputKey(
    submissionId: number,
    fileName: string,
    key: string
  ): Promise<any> {
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
    return this.occurrenceRepository.updateDWCSourceForOccurrenceSubmission(submissionId, jsonData);
  }

  /**
   * Query builder to find spatial component by given criteria
   *
   * @param {ISpatialComponentsSearchCriteria} criteria
   * @return {*}  {Promise<ISubmissionSpatialComponent[]>}
   * @memberof SpatialService
   */
  async findSpatialMetadataBySubmissionSpatialComponentIds(
    submissionSpatialComponentIds: number[]
  ): Promise<GeoJsonProperties[]> {
    const response = await this.occurrenceRepository.findSpatialMetadataBySubmissionSpatialComponentIds(
      submissionSpatialComponentIds
    );

    return response.map((row) => row.spatial_component_properties);
  }

  /**
   * Soft delete Occurrence Submission
   *
   * @param {number} occurrenceSubmissionId
   * @return {*}
   * @memberof OccurrenceService
   */
  async deleteOccurrenceSubmission(
    occurrenceSubmissionId: number
  ): Promise<
    {
      submission_spatial_component_id: number;
    }[]
  > {
    await this.occurrenceRepository.softDeleteOccurrenceSubmission(occurrenceSubmissionId);

    await this.occurrenceRepository.deleteSpatialTransformSubmission(occurrenceSubmissionId);

    return this.occurrenceRepository.deleteSubmissionSpatialComponent(occurrenceSubmissionId);
  }
}
