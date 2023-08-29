import { FeatureCollection, GeoJsonProperties } from 'geojson';
import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { getKnex } from '../database/db';
import { appendSQLColumnsEqualValues, AppendSQLColumnsEqualValues } from '../utils/sql-utils';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export interface IOccurrenceSubmission {
  occurrence_submission_id: number;
  survey_id: number;
  template_methodology_species_id: number;
  source: string;
  input_key: string;
  input_file_name: string;
  output_key: string;
  output_file_name: string;
  darwin_core_source: Record<any, any>;
}

export type EmptyObject = Record<string, never>;
export interface ITaxaData {
  associated_taxa?: string;
  vernacular_name?: string;
  submission_spatial_component_id: number;
}

export interface ISubmissionSpatialSearchResponseRow {
  taxa_data: ITaxaData[];
  spatial_component: {
    spatial_data: FeatureCollection | EmptyObject;
  };
}

export interface ISpatialComponentFeaturePropertiesRow {
  spatial_component_properties: GeoJsonProperties;
}

export class OccurrenceRepository extends BaseRepository {
  async updateDWCSourceForOccurrenceSubmission(submissionId: number, jsonData: string): Promise<number> {
    try {
      const sql = SQL`
      UPDATE
        occurrence_submission
      SET
        darwin_core_source = ${jsonData}
      WHERE
        occurrence_submission_id = ${submissionId}
      RETURNING
        occurrence_submission_id;
    `;
      const response = await this.connection.sql<{ occurrence_submission_id: number }>(sql);

      if (!response.rowCount) {
        throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
      }
      return response.rows[0].occurrence_submission_id;
    } catch (error) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }
  }

  /**
   * Gets an `occurrence_submission` for an id or null if nothing is found
   *
   * @param {number} submissionId
   * @return {*}  {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        occurrence_submission
      WHERE
        occurrence_submission_id = ${submissionId};
    `;

    const response = await this.connection.sql<IOccurrenceSubmission>(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE);
    }
    return result;
  }

  /**
   * Gets a list of `occurrence` for a `occurrence_submission_id`.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<any[]>}
   */
  async getOccurrencesForView(submissionId: number): Promise<ISubmissionSpatialSearchResponseRow[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('distinct_geographic_points', this._withDistinctGeographicPoints)
      .with('with_filtered_spatial_component', (qb1) => {
        // Get the spatial components that match the search filters
        qb1
          .select(
            knex.raw(
              "jsonb_array_elements(ssc.spatial_component -> 'features') #> '{properties, dwc, datasetID}' as dataset_id"
            ),
            knex.raw(
              "jsonb_array_elements(ssc.spatial_component -> 'features') #> '{properties, dwc, associatedTaxa}' as associated_taxa"
            ),
            knex.raw(
              "jsonb_array_elements(ssc.spatial_component -> 'features') #> '{properties, dwc, vernacularName}' as vernacular_name"
            ),
            'ssc.submission_spatial_component_id',
            'ssc.occurrence_submission_id',
            'ssc.spatial_component',
            'ssc.geography'
          )
          .from('submission_spatial_component as ssc')
          .leftJoin('distinct_geographic_points as p', 'p.geography', 'ssc.geography')
          .groupBy('ssc.submission_spatial_component_id')
          .groupBy('ssc.occurrence_submission_id')
          .groupBy('ssc.spatial_component')
          .groupBy('ssc.geography');

        qb1.where((qb2) => {
          qb2.whereRaw(
            `occurrence_submission_id in (select occurrence_submission_id from submission_spatial_component where occurrence_submission_id in (${submissionId}))`
          );
        });
      })
      .with('with_coalesced_spatial_components', (qb3) => {
        qb3
          .select(
            // Select the non-secure spatial component from the search results
            'submission_spatial_component_id',
            'occurrence_submission_id',
            'geography',
            knex.raw(
              `jsonb_build_object( 'submission_spatial_component_id', wfsc.submission_spatial_component_id, 'associated_taxa', wfsc.associated_taxa, 'vernacular_name', wfsc.vernacular_name) taxa_data_object`
            ),
            knex.raw(`jsonb_build_object( 'spatial_data', wfsc.spatial_component) spatial_component`)
          )
          .from(knex.raw('with_filtered_spatial_component as wfsc'));
      })
      .select(
        knex.raw('array_agg(submission_spatial_component_id) as submission_spatial_component_ids'),
        knex.raw('array_agg(taxa_data_object) as taxa_data'),
        knex.raw('(array_agg(spatial_component))[1] as spatial_component'),
        'geography'
      )
      .from('with_coalesced_spatial_components')
      // Filter out secure spatial components that have no spatial representation
      // The user is not allowed to see any aspect of these particular spatial components
      .whereRaw("spatial_component->'spatial_data' != '{}'")
      .groupBy('geography');

    const response = await this.connection.knex<ISubmissionSpatialSearchResponseRow>(queryBuilder);

    return response.rows;
  }

  _withDistinctGeographicPoints(qb1: Knex.QueryBuilder) {
    qb1
      .distinct()
      .select('geography')
      .from('submission_spatial_component')
      .whereRaw(`geometrytype(geography) = 'POINT'`)
      .whereRaw(`jsonb_path_exists(spatial_component,'$.features[*] \\? (@.properties.type == "Occurrence")')`);
  }

  /**
   * Update existing `occurrence_submission` record with outputKey and outputFileName.
   *
   * @param {number} submissionId
   * @param {string} outputFileName
   * @param {string} outputKey
   * @return {*}  {Promise<any>}
   */
  async updateSurveyOccurrenceSubmissionWithOutputKey(
    submissionId: number,
    outputFileName: string,
    outputKey: string
  ): Promise<any> {
    const items: AppendSQLColumnsEqualValues[] = [];

    items.push({ columnName: 'output_file_name', columnValue: outputFileName });

    items.push({ columnName: 'output_key', columnValue: outputKey });

    const sqlStatement = SQL`
      UPDATE occurrence_submission
      SET
    `;

    appendSQLColumnsEqualValues(sqlStatement, items);

    sqlStatement.append(SQL`
      WHERE
        occurrence_submission_id = ${submissionId}
      RETURNING occurrence_submission_id as id;
    `);

    const updateResponse = await await this.connection.sql(sqlStatement);

    if (!updateResponse || !updateResponse.rowCount) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }

    return updateResponse.rows[0];
  }

  /**
   * Query builder to find spatial component from a given submission id
   *
   * @param {number} submission_spatial_component_id
   * @return {*}  {Promise<ISubmissionSpatialComponent>}
   * @memberof SpatialRepository
   */
  async findSpatialMetadataBySubmissionSpatialComponentIds(
    submission_spatial_component_ids: number[]
  ): Promise<ISpatialComponentFeaturePropertiesRow[]> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .with('with_filtered_spatial_component', (qb1) => {
        // Get the spatial components that match the search filters
        qb1
          .select()
          .from('submission_spatial_component as ssc')
          .whereIn('submission_spatial_component_id', submission_spatial_component_ids);
      })
      .select(
        // Select the non-secure spatial component from the search results
        knex.raw(
          `jsonb_array_elements(wfsc.spatial_component -> 'features') #> '{properties}' as spatial_component_properties`
        )
      )
      .from(knex.raw('with_filtered_spatial_component as wfsc'));

    const response = await this.connection.knex<ISpatialComponentFeaturePropertiesRow>(queryBuilder);

    return response.rows;
  }

  /**
   * Soft delete Occurrence Submission, setting a delete Timestamp
   *
   * @param {number} occurrenceSubmissionId
   * @memberof OccurrenceRepository
   */
  async softDeleteOccurrenceSubmission(occurrenceSubmissionId: number) {
    const sqlStatement = SQL`
      UPDATE occurrence_submission
      SET delete_timestamp = now()
      WHERE occurrence_submission_id = ${occurrenceSubmissionId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Delete all spatial components by occurrence Id
   *
   * @param {number} occurrenceSubmissionId
   * @return {*}  {Promise<{ submission_spatial_component_id: number }[]>}
   * @memberof OccurrenceRepository
   */
  async deleteSubmissionSpatialComponent(
    occurrenceSubmissionId: number
  ): Promise<{ submission_spatial_component_id: number }[]> {
    const sqlDeleteStatement = SQL`
      DELETE FROM
        submission_spatial_component
      WHERE
        occurrence_submission_id = ${occurrenceSubmissionId}
      RETURNING
        submission_spatial_component_id;
    `;

    return (await this.connection.sql<{ submission_spatial_component_id: number }>(sqlDeleteStatement)).rows;
  }

  /**
   * Delete all spatial transform history by occurrence Id
   *
   * @param {number} occurrenceSubmissionId
   * @return {*}  {Promise<void>}
   * @memberof OccurrenceRepository
   */
  async deleteSpatialTransformSubmission(occurrenceSubmissionId: number): Promise<void> {
    const sqlDeleteStatement = SQL`
      DELETE FROM spatial_transform_submission
      USING spatial_transform_submission as sts
      LEFT OUTER JOIN submission_spatial_component as ssc ON
        sts.submission_spatial_component_id = ssc.submission_spatial_component_id
      WHERE
        ssc.occurrence_submission_id = ${occurrenceSubmissionId};
    `;

    await this.connection.sql(sqlDeleteStatement);
  }
}
