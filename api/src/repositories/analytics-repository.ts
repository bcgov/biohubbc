import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IObservationCountByGroup } from '../services/analytics-service';
import { BaseRepository } from './base-repository';

// const observationCountByGroupSchema = z.object({
//   count: z.number(),
//   percentage: z.number(),
//   survey_sample_site_id: z.number().optional(),
//   survey_sample_method_id: z.number().optional(),
//   survey_sample_period_id: z.number().optional(),
//   observation_date: z.string().optional(),
//   critterbase_taxon_measurement_id: z.string().optional().nullable(),
//   critterbase_measurement_qualitative_option_id: z.string().optional().nullable(),
//   value: z.number().optional().nullable(),
//   itis_tsn: z.number().optional()
// });

export interface IObservationCountByGroupWithMeasurements extends IObservationCountByGroup {
  quant_measurements: { value: number; critterbase_taxon_measurement_id: string }[];
  qual_measurements: { option_id: string; critterbase_taxon_measurement_id: string }[];
}

export class AnalyticsRepository extends BaseRepository {
  /**
   * Gets a survey record for a given survey ID
   *
   * @param {number[]} surveyIds
   * @param {string[]} groupByColumns
   * @param {string[]} groupByQuantitativeMeasurements
   * @param {string[]} groupByQualitativeMeasurements
   * @return {*}  {Promise<SurveyRecord>}
   * @memberof SurveyRepository
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<IObservationCountByGroupWithMeasurements[]> {
    const knex = getKnex();

    const combinedColumns = [...groupByColumns, ...groupByQuantitativeMeasurements, ...groupByQualitativeMeasurements];

    // subquery to get total count, used for calculating ratios
    const totalCountSubquery = knex('observation_subcount as os')
      .sum('os.subcount as total')
      .leftJoin('survey_observation as so', 'so.survey_observation_id', 'os.survey_observation_id')
      .whereIn('so.survey_id', surveyIds)
      .first()
      .toString();

    // Turns subcount quantitative measurements into columns that are included in the group by clause
    const quantColumns = groupByQuantitativeMeasurements.map((id) =>
      knex.raw(`MAX(CASE WHEN quant.critterbase_taxon_measurement_id = ? THEN quant.value END) as "${id}"`, [id])
    );

    // Turns subcount qualitative measurements into columns that are included in the group by clause
    const qualColumns = groupByQualitativeMeasurements.map((id) =>
      knex.raw(
        `STRING_AGG(DISTINCT CASE WHEN qual.critterbase_taxon_measurement_id = ? THEN qual.critterbase_measurement_qualitative_option_id::text END, ',') as "${id}"`,
        [id]
      )
    );

    const sqlStatement = knex
      .with('temp_observations', (qb) => {
        qb.select(
          'os.subcount',
          'os.observation_subcount_id',
          'so.survey_id',
          ...groupByColumns.map((column) => knex.raw(`?? as ??`, [column, column])),
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
      .select(knex.raw('SUM(subcount)::NUMERIC as count'))
      .select(knex.raw(`ROUND(SUM(os.subcount)::NUMERIC / (${totalCountSubquery}) * 100, 2) as percentage`))
      .select(groupByColumns.map((column) => knex.raw(`?? as ??`, [column, column])))
      .select(
        knex.raw(
          `jsonb_build_object(
        ${groupByQuantitativeMeasurements.map((column) => `'${column}', "${column}"`).join(', ')}
      ) as quant_measurements`
        )
      )
      .select(
        knex.raw(
          `jsonb_build_object(
        ${groupByQualitativeMeasurements.map((column) => `'${column}', "${column}"`).join(', ')}
      ) as qual_measurements`
        )
      )
      .from('temp_observations as os')
      .groupBy(combinedColumns)
      .orderBy('count', 'desc');

    const response = await this.connection.knex(sqlStatement);

    console.log(response);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get observation count by group', [
        'AnalyticsRepository->getObservationCountByGroup',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows;
  }
}
