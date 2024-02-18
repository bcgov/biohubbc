import { FeatureCollection } from 'geojson';
import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';

export interface IInsertSpatialTransform {
  name: string;
  description: string;
  notes: string;
  transform: string;
}

export interface IGetSpatialTransformRecord {
  spatial_transform_id: number;
  name: string;
  description: string | null;
  notes: string | null;
  transform: string;
}

export interface ITransformSpatialRow {
  result_data: FeatureCollection;
}

export interface ISubmissionSpatialComponent {
  submission_spatial_component_ids: number[];
  occurrence_submission_id: number;
  spatial_component: FeatureCollection;
  geometry: string;
}

export class SpatialRepository extends BaseRepository {
  /**
   * get spatial transform records
   *
   * @param
   * @return {*}  {Promise<IGetSpatialTransformRecord>}
   * @memberof SpatialRepository
   */
  async getSpatialTransformRecords(): Promise<IGetSpatialTransformRecord[]> {
    const sqlStatement = SQL`
      SELECT
        spatial_transform_id,
        name,
        description,
        notes,
        transform
      FROM
        spatial_transform;
    `;

    const response = await this.connection.sql<IGetSpatialTransformRecord>(sqlStatement);

    return response.rows;
  }

  /**
   * Insert record of transform id used for submission spatial component record
   *
   * @param {number} spatialTransformId
   * @param {number} submissionSpatialComponentId
   * @return {*}  {Promise<{ spatial_transform_submission_id: number }>}
   * @memberof SpatialRepository
   */
  async insertSpatialTransformSubmissionRecord(
    spatialTransformId: number,
    submissionSpatialComponentId: number
  ): Promise<{ spatial_transform_submission_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO spatial_transform_submission (
        spatial_transform_id,
        submission_spatial_component_id
      ) VALUES (
        ${spatialTransformId},
        ${submissionSpatialComponentId}
      )
      RETURNING
        spatial_transform_submission_id;
    `;

    const response = await this.connection.sql<{ spatial_transform_submission_id: number }>(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError(
        'Failed to insert spatial transform submission id and submission spatial component id',
        [
          'SpatialRepository->insertSpatialTransformSubmissionRecord',
          'rowCount was null or undefined, expected rowCount >= 1'
        ]
      );
    }
    return response.rows[0];
  }

  /**
   * Run Spatial Transform with transform string on submissionId
   *
   * @param {number} submissionId
   * @param {string} transform
   * @return {*}  {Promise<ITransformRow[]>}
   * @memberof SpatialRepository
   */
  async runSpatialTransformOnSubmissionId(submissionId: number, transform: string): Promise<ITransformSpatialRow[]> {
    const response = await this.connection.query(transform, [submissionId]);

    return response.rows;
  }

  /**
   * Insert given transformed data into Spatial Component Table
   *
   * @param {number} submissionId
   * @param {Feature[]} transformedData
   * @return {*}  {Promise<{ submission_spatial_component_id: number }>}
   * @memberof SpatialRepository
   */
  async insertSubmissionSpatialComponent(
    submissionId: number,
    transformedData: FeatureCollection
  ): Promise<{ submission_spatial_component_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO submission_spatial_component (
        occurrence_submission_id,
        spatial_component,
        geometry
      ) VALUES (
        ${submissionId},
        ${JSON.stringify(transformedData)}
    `;

    if (transformedData.features && transformedData.features.length > 0) {
      const geoCollection = generateGeometryCollectionSQL(transformedData.features);

      sqlStatement.append(SQL`
        ,public.ST_Force2D(
          public.ST_Transform(
            public.ST_SetSRID(
      `);

      sqlStatement.append(geoCollection);

      sqlStatement.append(SQL`
        , 4326)), 3005)
      `);
    } else {
      sqlStatement.append(SQL`
        ,null
      `);
    }

    sqlStatement.append(SQL`
      )
      RETURNING
        submission_spatial_component_id;
    `);

    const response = await this.connection.sql<{ submission_spatial_component_id: number }>(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert submission spatial component details', [
        'SpatialRepository->insertSubmissionSpatialComponent',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
    return response.rows[0];
  }

  /**
   * Deletes spatial components in a submission id before updating it with new data
   *
   * @param {number} occurrence_submission_id
   * @return {*}  {Promise<{ occurrence_submission_id: number }[]>}
   * @memberof SpatialRepository
   */
  async deleteSpatialComponentsBySubmissionId(
    occurrence_submission_id: number
  ): Promise<{ occurrence_submission_id: number }[]> {
    const sqlStatement = SQL`
      DELETE FROM
        submission_spatial_component
      WHERE
        occurrence_submission_id=${occurrence_submission_id}
      RETURNING
        occurrence_submission_id;
    ;`;

    const response = await this.connection.sql<{ occurrence_submission_id: number }>(sqlStatement);

    return response.rows;
  }

  /**
   * Remove references in spatial_transform_submission table
   *
   * @param {number} occurrence_submission_id
   * @return {*}  {Promise<{ occurrence_submission_id: number }[]>}
   * @memberof SpatialRepository
   */
  async deleteSpatialComponentsSpatialTransformRefsBySubmissionId(
    occurrence_submission_id: number
  ): Promise<{ occurrence_submission_id: number }[]> {
    const sqlStatement = SQL`
      DELETE FROM
        spatial_transform_submission
      WHERE
        submission_spatial_component_id IN (
          SELECT
            submission_spatial_component_id
          FROM
            submission_spatial_component
          WHERE
            occurrence_submission_id=${occurrence_submission_id}
        )
      RETURNING
        ${occurrence_submission_id};
    `;

    const response = await this.connection.sql<{ occurrence_submission_id: number }>(sqlStatement);

    return response.rows;
  }
}
