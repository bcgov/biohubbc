import { getKnex } from '../database/db';
import { ObservationCountByGroupSQLResponse } from '../models/observation-analytics';
import { BaseRepository } from './base-repository';

/**
 * Map of group by column names to their fully qualified 'table.column' names
 */
const GroupByColumnFullyQualifiedNameMapping: Record<string, string> = {
  survey_sample_site_id: 'survey_sample_site.survey_sample_site_id',
  method_technique_id: 'method_technique.method_technique_id',
  survey_sample_period_id: 'survey_sample_period.survey_sample_period_id',
  itis_tsn: 'survey_observation.itis_tsn',
  observation_date: 'survey_observation.observation_date'
};

/**
 * Repository for handling analytics related database operations.
 *
 * @export
 * @class AnalyticsRepository
 * @extends {BaseRepository}
 */
export class AnalyticsRepository extends BaseRepository {
  /**
   * Gets the observation count by group for given survey IDs
   *
   * @param {number[]} surveyIds - Array of survey IDs
   * @param {string[]} groupByColumns - Columns to group by
   * @param {string[]} groupByQuantitativeMeasurements - Quantitative measurements to group by
   * @param {string[]} groupByQualitativeMeasurements - Qualitative measurements to group by
   * @returns {Promise<ObservationCountByGroupSQLResponse[]>} - Observation count by group
   * @memberof AnalyticsRepository
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<ObservationCountByGroupSQLResponse[]> {
    const fullyQualifiedGroupByColumnNames = this._getFullyQualifiedGroupByColumnNames(groupByColumns);

    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    // Subquery to get the total count, used for calculating ratios
    const totalCountSubquery = knex('observation_subcount')
      .sum('observation_subcount.subcount as total')
      .innerJoin(
        'survey_observation',
        'survey_observation.survey_observation_id',
        'observation_subcount.survey_observation_id'
      )
      .whereIn('survey_observation.survey_id', surveyIds)
      .first()
      .toString();

    // Create columns for quantitative measurements
    const quantitativeMeasurementGroupByColumnNames = groupByQuantitativeMeasurements.map((id) =>
      knex.raw(
        `MAX(
          CASE 
            WHEN observation_subcount_quantitative_measurement.critterbase_taxon_measurement_id = ? 
            THEN observation_subcount_quantitative_measurement.value 
          END
        ) as ??`,
        [id, id]
      )
    );

    // Create columns for qualitative measurements
    const qualitativeMeasurementGroupByColumnNames = groupByQualitativeMeasurements.map((id) =>
      knex.raw(
        `STRING_AGG(
          DISTINCT 
            CASE 
              WHEN observation_subcount_qualitative_measurement.critterbase_taxon_measurement_id = ? 
              THEN observation_subcount_qualitative_measurement.critterbase_measurement_qualitative_option_id::text 
            END, 
        ',') as ??`,
        [id, id]
      )
    );

    queryBuilder.with('w_observations', (qb) => {
      qb.select(
        'observation_subcount.subcount',
        'observation_subcount.observation_subcount_id',
        'survey_observation.survey_id',
        ...fullyQualifiedGroupByColumnNames.map((column) => knex.raw('??', [column])),
        ...quantitativeMeasurementGroupByColumnNames,
        ...qualitativeMeasurementGroupByColumnNames
      );

      if (groupByColumns.includes('survey_sample_site_id')) {
        qb.select('survey_sample_site.name as survey_sample_site_name');
      }

      if (groupByColumns.includes('method_technique_id')) {
        qb.select('method_technique.name as method_technique_name');
      }

      if (groupByColumns.includes('survey_sample_period_id')) {
        qb.select(
          'survey_sample_period.start_date',
          'survey_sample_period.start_time',
          'survey_sample_period.end_date',
          'survey_sample_period.end_time'
        );
      }

      qb.from('observation_subcount').innerJoin(
        'survey_observation',
        'survey_observation.survey_observation_id',
        'observation_subcount.survey_observation_id'
      );

      if (
        groupByColumns.includes('survey_sample_period_id') ||
        groupByColumns.includes('method_technique_id') ||
        groupByColumns.includes('survey_sample_site_id')
      ) {
        qb.leftJoin(
          'survey_sample_period',
          'survey_sample_period.survey_sample_period_id',
          'survey_observation.survey_sample_period_id'
        );
      }

      if (groupByColumns.includes('method_technique_id')) {
        qb.leftJoin(
          'method_technique',
          'method_technique.method_technique_id',
          'survey_sample_period.method_technique_id'
        );
      }

      if (groupByColumns.includes('survey_sample_site_id')) {
        qb.leftJoin(
          'survey_sample_site',
          'survey_sample_site.survey_sample_site_id',
          'survey_sample_period.survey_sample_site_id'
        );
      }

      qb.leftJoin(
        'observation_subcount_qualitative_measurement',
        'observation_subcount_qualitative_measurement.observation_subcount_id',
        'observation_subcount.observation_subcount_id'
      );

      qb.leftJoin(
        'observation_subcount_quantitative_measurement',
        'observation_subcount_quantitative_measurement.observation_subcount_id',
        'observation_subcount.observation_subcount_id'
      );

      qb.whereIn('survey_observation.survey_id', surveyIds);

      qb.groupBy(
        'observation_subcount.subcount',
        'observation_subcount.observation_subcount_id',
        'survey_observation.survey_id',
        ...fullyQualifiedGroupByColumnNames
      );

      if (groupByColumns.includes('survey_sample_site_id')) {
        qb.groupBy('survey_sample_site.name');
      }

      if (groupByColumns.includes('method_technique_id')) {
        qb.groupBy('method_technique.name');
      }

      if (groupByColumns.includes('survey_sample_period_id')) {
        qb.groupBy(
          'survey_sample_period.start_date',
          'survey_sample_period.start_time',
          'survey_sample_period.end_date',
          'survey_sample_period.end_time'
        );
      }
    });

    queryBuilder.select(knex.raw('public.gen_random_uuid() as id')); // Generate a unique ID for the row

    queryBuilder.select(knex.raw('COUNT(subcount)::NUMERIC as row_count'));

    queryBuilder.select(knex.raw('SUM(subcount)::NUMERIC as individual_count'));

    queryBuilder.select(
      knex.raw(
        `ROUND(SUM(w_observations.subcount)::NUMERIC / (${totalCountSubquery}) * 100, 2) as individual_percentage`
      )
    );

    queryBuilder.select(groupByColumns.map((column) => knex.raw('??', [column])));

    // Measurement properties are objects of {'<critterbase_taxon_measurement_id>' : '<value>', '<critterbase_taxon_measurement_id>' : '<value>'}
    queryBuilder.select(
      knex.raw(
        `jsonb_build_object(${groupByQuantitativeMeasurements
          .map((column) => `'${column}', ??`)
          .join(', ')}) as quant_measurements`,
        groupByQuantitativeMeasurements
      )
    );

    queryBuilder.select(
      knex.raw(
        `jsonb_build_object(${groupByQualitativeMeasurements
          .map((column) => `'${column}', ??`)
          .join(', ')}) as qual_measurements`,
        groupByQualitativeMeasurements
      )
    );

    if (groupByColumns.includes('survey_sample_site_id')) {
      queryBuilder.select('w_observations.survey_sample_site_name');

      queryBuilder.groupBy('w_observations.survey_sample_site_name');
    }

    if (groupByColumns.includes('method_technique_id')) {
      queryBuilder.select('w_observations.method_technique_name');

      queryBuilder.groupBy('w_observations.method_technique_name');
    }

    if (groupByColumns.includes('survey_sample_period_id')) {
      queryBuilder.select(
        'w_observations.start_date',
        'w_observations.start_time',
        'w_observations.end_date',
        'w_observations.end_time'
      );

      queryBuilder.groupBy(
        'w_observations.start_date',
        'w_observations.start_time',
        'w_observations.end_date',
        'w_observations.end_time'
      );
    }

    queryBuilder.from('w_observations');

    if (groupByColumns.length) {
      queryBuilder.groupBy(...groupByColumns, ...groupByQuantitativeMeasurements, ...groupByQualitativeMeasurements);
    }

    queryBuilder.orderBy('individual_count', 'desc');

    const response = await this.connection.knex(queryBuilder, ObservationCountByGroupSQLResponse);

    return response.rows;
  }

  /**
   * Get the fully qualified column names for the provided group by columns.
   *
   * @example
   * const groupByColumns = ['survey_sample_site_id', 'itis_tsn'];
   * const fullyQualifiedGroupByColumns = _getFullyQualifiedGroupByColumnNames(groupByColumns);
   * // fullyQualifiedGroupByColumns = ['survey_sample_site.survey_sample_site_id', 'survey_observation.itis_tsn']
   *
   * @param {string[]} groupByColumns
   * @memberof AnalyticsRepository
   */
  _getFullyQualifiedGroupByColumnNames = (groupByColumns: string[]) => {
    const fullyQualifiedGroupByColumns: string[] = [];

    for (const column of groupByColumns) {
      const fullyQualifiedColumn = GroupByColumnFullyQualifiedNameMapping[column];

      if (fullyQualifiedColumn) {
        fullyQualifiedGroupByColumns.push(fullyQualifiedColumn);
      }
    }

    return fullyQualifiedGroupByColumns;
  };
}
