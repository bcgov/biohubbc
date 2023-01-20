import { IDBConnection } from '../database/db';
import { IGetSpatialTransformRecord, SpatialRepository } from '../repositories/spatial-repository';
import { DBService } from './db-service';

export class SpatialService extends DBService {
  spatialRepository: SpatialRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.spatialRepository = new SpatialRepository(connection);
  }

  /**
   * get spatial transform records
   *
   * @return {*}  {Promise<IGetSpatialTransformRecord[]>}
   * @memberof SpatialService
   */
  async getSpatialTransformRecords(): Promise<IGetSpatialTransformRecord[]> {
    return this.spatialRepository.getSpatialTransformRecords();
  }

  /**
   * Insert record of transform id used for submission spatial component record
   *
   * @param {number} spatialTransformId
   * @param {number} submissionSpatialComponentId
   * @return {*}  {Promise<{ spatial_transform_submission_id: number }>}
   * @memberof SpatialService
   */
  async insertSpatialTransformSubmissionRecord(
    spatialTransformId: number,
    submissionSpatialComponentId: number
  ): Promise<{ spatial_transform_submission_id: number }> {
    return this.spatialRepository.insertSpatialTransformSubmissionRecord(
      spatialTransformId,
      submissionSpatialComponentId
    );
  }

  /**
   * Collect transforms from db, run transformations on submission id, save result to spatial component table
   *
   * @param {number} submissionId
   * @return {*}  {Promise<void>}
   * @memberof SpatialService
   */
  async runSpatialTransforms(submissionId: number): Promise<void> {
    const spatialTransformRecords = await this.getSpatialTransformRecords();

    const transformRecordPromises = spatialTransformRecords.map(async (transformRecord) => {
      const transformed = await this.spatialRepository.runSpatialTransformOnSubmissionId(
        submissionId,
        transformRecord.transform
      );

      const insertSpatialTransformSubmissionRecordPromises = transformed.map(async (dataPoint) => {
        const submissionSpatialComponentId = await this.spatialRepository.insertSubmissionSpatialComponent(
          submissionId,
          dataPoint.result_data
        );

        await this.insertSpatialTransformSubmissionRecord(
          transformRecord.spatial_transform_id,
          submissionSpatialComponentId.submission_spatial_component_id
        );
      });

      await Promise.all(insertSpatialTransformSubmissionRecordPromises);
    });

    await Promise.all(transformRecordPromises);
  }

  /**
   * Delete spatial component records by submission id.
   *
   * @param {number} occurrence_submission_id
   * @return {*}  {Promise<{ occurrence_submission_id: number }[]>}
   * @memberof SpatialService
   */
  async deleteSpatialComponentsBySubmissionId(
    occurrence_submission_id: number
  ): Promise<{ occurrence_submission_id: number }[]> {
    return this.spatialRepository.deleteSpatialComponentsBySubmissionId(occurrence_submission_id);
  }

  /**
   * Delete records referencing which spatial transforms were applied to a spatial component
   *
   * @param {number} occurrence_submission_id
   * @return {*}  {Promise<{ occurrence_submission_id: number }[]>}
   * @memberof SpatialService
   */
  async deleteSpatialComponentsSpatialTransformRefsBySubmissionId(
    occurrence_submission_id: number
  ): Promise<{ occurrence_submission_id: number }[]> {
    return this.spatialRepository.deleteSpatialComponentsSpatialTransformRefsBySubmissionId(occurrence_submission_id);
  }
}
