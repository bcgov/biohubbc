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
  quantitative_measurements: { value: number; critterbase_taxon_measurement_id: string }[];
  qualitative_measurements: { option_id: string; critterbase_taxon_measurement_id: string }[];
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

    const totalSubquery = knex('observation_subcount as os')
      .sum('os.subcount as total')
      .leftJoin('survey_observation as so', 'so.survey_observation_id', 'os.survey_observation_id')
      // The main query below duplicates subcount values by joining on subcounts measurements,
      // so we join on measurements here to correctly calculate the total
      .leftJoin(
        'observation_subcount_quantitative_measurement as quant',
        'quant.observation_subcount_id',
        'os.observation_subcount_id'
      )
      .leftJoin(
        'observation_subcount_qualitative_measurement as qual',
        'qual.observation_subcount_id',
        'os.observation_subcount_id'
      )
      .whereIn('so.survey_id', surveyIds)
      .first()
      .toString();

    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('SUM(subcount)::NUMERIC as count'))
      .select(
        groupByQuantitativeMeasurements.length > 0
          ? knex.raw(
              `jsonb_agg(
                jsonb_build_object(
                    'critterbase_taxon_measurement_id', quant.critterbase_taxon_measurement_id,
                    'value', value
                )
                ) FILTER (WHERE quant.critterbase_taxon_measurement_id IN (${groupByQuantitativeMeasurements
                  .map(() => '?')
                  .join(', ')})) AS quantitative_measurements`,
              groupByQuantitativeMeasurements
            )
          : knex.raw(`'[]'::jsonb as quantitative_measurements`)
      )
      .select(
        groupByQualitativeMeasurements.length > 0
          ? knex.raw(
              `jsonb_agg(
                jsonb_build_object(
                    'critterbase_taxon_measurement_id', qual.critterbase_taxon_measurement_id,
                    'option_id', critterbase_measurement_qualitative_option_id
                )
                ) FILTER (WHERE quant.critterbase_taxon_measurement_id IN (${groupByQualitativeMeasurements
                  .map(() => '?')
                  .join(', ')})) AS qualitative_measurements`,
              groupByQualitativeMeasurements
            )
          : knex.raw(`'[]'::jsonb as qualitative_measurements`)
      )
      .select(knex.raw(`ROUND(SUM(os.subcount)::NUMERIC / (${totalSubquery}) * 100, 2) as percentage`))
      .select(groupByColumns.map((column) => knex.raw(`?? as ??`, [column, column])))
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
      .groupBy(groupByColumns)
      .groupBy(
        groupByQualitativeMeasurements.length ||
          (groupByQuantitativeMeasurements && 'qual.critterbase_taxon_measurement_id')
      )
      .groupBy(groupByQualitativeMeasurements && 'critterbase_measurement_qualitative_option_id')
      .groupBy(groupByQuantitativeMeasurements && 'value')
      .orderBy('count', 'desc');

    const response = await this.connection.knex(sqlStatement);

    console.log(response.rows[0].quantitative_measurements);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get observation count by group', [
        'AnalyticsRepository->getObservationCountByGroup',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows;
  }
}
