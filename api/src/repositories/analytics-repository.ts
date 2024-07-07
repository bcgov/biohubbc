import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ObservationCountByGroupWithMeasurements } from '../models/observation-analytics';
import { BaseRepository } from './base-repository';

export class AnalyticsRepository extends BaseRepository {
  /**
   * Gets the observation count by group for given survey IDs
   *
   * @param {number[]} surveyIds - Array of survey IDs
   * @param {string[]} groupByColumns - Columns to group by
   * @param {string[]} groupByQuantitativeMeasurements - Quantitative measurements to group by
   * @param {string[]} groupByQualitativeMeasurements - Qualitative measurements to group by
   * @returns {Promise<IObservationCountByGroupWithMeasurements[]>} - Observation count by group
   * @memberof AnalyticsRepository
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<ObservationCountByGroupWithMeasurements[]> {
    const knex = getKnex();

    const combinedColumns = [...groupByColumns, ...groupByQuantitativeMeasurements, ...groupByQualitativeMeasurements];

    // Subquery to get the total count, used for calculating ratios
    const totalCountSubquery = knex('observation_subcount as os')
      .sum('os.subcount as total')
      .leftJoin('survey_observation as so', 'so.survey_observation_id', 'os.survey_observation_id')
      .whereIn('so.survey_id', surveyIds)
      .first()
      .toString();

    // Create columns for quantitative measurements
    const quantColumns = groupByQuantitativeMeasurements.map((id) =>
      knex.raw(`MAX(CASE WHEN quant.critterbase_taxon_measurement_id = ? THEN quant.value END) as ??`, [id, id])
    );

    // Create columns for qualitative measurements
    const qualColumns = groupByQualitativeMeasurements.map((id) =>
      knex.raw(
        `STRING_AGG(DISTINCT CASE WHEN qual.critterbase_taxon_measurement_id = ? THEN qual.critterbase_measurement_qualitative_option_id::text END, ',') as ??`,
        [id, id]
      )
    );

    const sqlStatement = knex
      .with('temp_observations', (qb) => {
        qb.select(
          'os.subcount',
          'os.observation_subcount_id',
          'so.survey_id',
          ...groupByColumns.map((column) => knex.raw('??', [column])),
          ...quantColumns,
          ...qualColumns
        )
          .from('observation_subcount as os')
          .leftJoin('survey_observation as so', 'so.survey_observation_id', 'os.survey_observation_id')
          .leftJoin(
            'observation_subcount_qualitative_measurement as qual',
            'qual.observation_subcount_id',
            'os.observation_subcount_id'
          )
          .leftJoin(
            'observation_subcount_quantitative_measurement as quant',
            'quant.observation_subcount_id',
            'os.observation_subcount_id'
          )
          .whereIn('so.survey_id', surveyIds)
          .groupBy('os.subcount', 'os.observation_subcount_id', 'so.survey_id', ...groupByColumns);
      })
      .select(knex.raw('COUNT(subcount)::NUMERIC as row_count'))
      .select(knex.raw('SUM(subcount)::NUMERIC as individual_count'))
      .select(
        knex.raw(`ROUND(SUM(os.subcount)::NUMERIC / (${totalCountSubquery}) * 100, 2) as individual_percentage`)
      )
      .select(groupByColumns.map((column) => knex.raw('??', [column])))
      // Measurement properties are objects of {'<critterbase_taxon_measurement_id>' : '<value>', '<critterbase_taxon_measurement_id>' : '<value>'}
      .select(
        knex.raw(
          `jsonb_build_object(${groupByQuantitativeMeasurements
            .map((column) => `'${column}', ??`)
            .join(', ')}) as quant_measurements`,
          groupByQuantitativeMeasurements
        )
      )
      .select(
        knex.raw(
          `jsonb_build_object(${groupByQualitativeMeasurements
            .map((column) => `'${column}', ??`)
            .join(', ')}) as qual_measurements`,
          groupByQualitativeMeasurements
        )
      )
      .from('temp_observations as os')
      .groupBy(combinedColumns)
      .orderBy('individual_count', 'desc');

    const response = await this.connection.knex(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get observation count by group', [
        'AnalyticsRepository->getObservationCountByGroup',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows;
  }
}
