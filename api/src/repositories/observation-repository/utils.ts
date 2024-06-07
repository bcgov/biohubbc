import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';

/**
 * Generate the observation list query based on user access and filters.
 *
 * @param {boolean} isUserAdmin Whether the user is an admin.
 * @param {number | null} systemUserId The user's ID.
 * @param {IObservationAdvancedFilters} filterFields The filter fields to apply.
 * @return {Knex.QueryBuilder} The generated observation list query.
 */
export function makeFindObservationsQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields: IObservationAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const getSurveyIdsQuery = knex.select<any, { survey_id: number }>(['survey_id']).from('survey');

  // Ensure that users can only see observations that they are participating in, unless they are an administrator.
  if (!isUserAdmin) {
    getSurveyIdsQuery.whereIn('survey.project_id', (subqueryBuilder) =>
      subqueryBuilder
        .select('project.project_id')
        .from('project')
        .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
        .where('project_participation.system_user_id', systemUserId)
    );
  }

  const query = getSurveyObservationsBaseQuery(knex, getSurveyIdsQuery);

  // Apply filters
  if (filterFields.minimum_count) {
    query.andWhere('subcount', '>=', filterFields.minimum_count);
  }

  if (filterFields.minimum_date) {
    query.andWhere('observation_date', '>=', filterFields.minimum_date);
  }

  if (filterFields.maximum_date) {
    query.andWhere('observation_date', '<=', filterFields.maximum_date);
  }

  if (filterFields.keyword) {
    query.where((subqueryBuilder) => {
      subqueryBuilder.where('itis_scientific_name', 'ilike', `%${filterFields.keyword}%`);
      if (!isNaN(Number(filterFields.keyword))) {
        subqueryBuilder.orWhere('survey_observation.survey_observation_id', Number(filterFields.keyword));
      }
    });
  }

  if (filterFields.minimum_time) {
    query.andWhere('time', '>=', filterFields.minimum_time);
  }

  if (filterFields.maximum_time) {
    query.andWhere('time', '<=', filterFields.maximum_time);
  }

  if (filterFields.itis_tsns) {
    query.whereIn('itis_tsn', filterFields.itis_tsns);
  }

  return query;
}

/**
 * Get the base query for retrieving survey observations with sampling data.
 *
 * @param {Knex} knex The Knex instance.
 * @param {Knex.QueryBuilder} getSurveyIdsQuery A knex query builder that returns a list of survey IDs, which will be
 * used to filter the observations.
 * @return {Knex.QueryBuilder} The base query for retrieving survey observations, filtered by survey IDs returned by
 * the getSurveyIdsQuery.
 */
export function getSurveyObservationsBaseQuery(
  knex: Knex,
  getSurveyIdsQuery: Knex.QueryBuilder<any, { survey_id: number }>
): Knex.QueryBuilder {
  return (
    knex
      // Get all sample sites for the survey
      .with(
        'w_survey_sample_site',
        knex
          .select('survey_sample_site_id', 'name as survey_sample_site_name')
          .from('survey_sample_site')
          .whereIn('survey_id', getSurveyIdsQuery)
      )
      // Get all sample methods for the sample sites, and additionally fetch the method name
      .with(
        'w_survey_sample_method',
        knex
          .select(
            'survey_sample_method.survey_sample_site_id',
            'survey_sample_method.survey_sample_method_id',
            'method_lookup.name as survey_sample_method_name'
          )
          .from('survey_sample_method')
          .innerJoin('method_lookup', 'survey_sample_method.method_lookup_id', 'method_lookup.method_lookup_id')
          .innerJoin(
            'w_survey_sample_site',
            'survey_sample_method.survey_sample_site_id',
            'w_survey_sample_site.survey_sample_site_id'
          )
      )
      // Get all sample periods for the sample methods, and additionally create a datetime field from the start date and time
      .with(
        'w_survey_sample_period',
        knex
          .select(
            'w_survey_sample_method.survey_sample_site_id',
            'survey_sample_period.survey_sample_method_id',
            'survey_sample_period.survey_sample_period_id',
            knex.raw(
              `(survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime`
            )
          )
          .from('survey_sample_period')
          .innerJoin(
            'w_survey_sample_method',
            'survey_sample_period.survey_sample_method_id',
            'w_survey_sample_method.survey_sample_method_id'
          )
      )
      // Get all qualitative measurements for all subcounts associated to all observations for the survey
      .with(
        'w_qualitative_measurements',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
              )) as qualitative_measurements
            `)
          )
          .from('observation_subcount_qualitative_measurement')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', getSurveyIdsQuery);
              });
          })
          .groupBy('observation_subcount_id')
      )
      // Get all quantitative measurements for all subcounts associated to all observations for the survey
      .with(
        'w_quantitative_measurements',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                'value', value
              )) as quantitative_measurements
            `)
          )
          .from('observation_subcount_quantitative_measurement')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', getSurveyIdsQuery);
              });
          })
          .groupBy('observation_subcount_id')
      )
      // Get all qualitative environments for all subcounts associated to all observations for the survey
      .with(
        'w_qualitative_environments',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'observation_subcount_qualitative_environment_id', observation_subcount_qualitative_environment_id,
                'environment_qualitative_id', environment_qualitative_id,
                'environment_qualitative_option_id', environment_qualitative_option_id
              )) as qualitative_environments
            `)
          )
          .from('observation_subcount_qualitative_environment')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', getSurveyIdsQuery);
              });
          })
          .groupBy('observation_subcount_id')
      )
      // Get all quantitative environments for all subcounts associated to all observations for the survey
      .with(
        'w_quantitative_environments',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'observation_subcount_quantitative_environment_id', observation_subcount_quantitative_environment_id,
                'environment_quantitative_id', environment_quantitative_id,
                'value', value
              )) as quantitative_environments
            `)
          )
          .from('observation_subcount_quantitative_environment')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', getSurveyIdsQuery);
              });
          })
          .groupBy('observation_subcount_id')
      )
      // Rollup the subcount records into an array of objects for each observation
      .with(
        'w_subcounts',
        knex
          .select(
            'survey_observation_id',
            knex.raw(`
              json_agg(json_build_object(
                'observation_subcount_id', observation_subcount.observation_subcount_id,
                'subcount', subcount,
                'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
                'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json),
                'qualitative_environments', COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json),
                'quantitative_environments', COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json)
              )) as subcounts
            `)
          )
          .from('observation_subcount')
          .leftJoin(
            'w_qualitative_measurements',
            'observation_subcount.observation_subcount_id',
            'w_qualitative_measurements.observation_subcount_id'
          )
          .leftJoin(
            'w_quantitative_measurements',
            'observation_subcount.observation_subcount_id',
            'w_quantitative_measurements.observation_subcount_id'
          )
          .leftJoin(
            'w_qualitative_environments',
            'observation_subcount.observation_subcount_id',
            'w_qualitative_environments.observation_subcount_id'
          )
          .leftJoin(
            'w_quantitative_environments',
            'observation_subcount.observation_subcount_id',
            'w_quantitative_environments.observation_subcount_id'
          )
          .whereIn(
            'survey_observation_id',
            knex('survey_observation').select('survey_observation_id').whereIn('survey_id', getSurveyIdsQuery)
          )
          .groupBy('survey_observation_id')
      )
      // Return all observations for the surveys, including the additional sampling data, and rolled up subcount data
      .select(
        'survey_observation.survey_observation_id',
        'survey_observation.survey_id',
        'survey_observation.itis_tsn',
        'survey_observation.itis_scientific_name',
        'survey_observation.survey_sample_site_id',
        'survey_observation.survey_sample_method_id',
        'survey_observation.survey_sample_period_id',
        'survey_observation.latitude',
        'survey_observation.longitude',
        'survey_observation.count',
        'survey_observation.observation_date',
        'survey_observation.observation_time',
        'w_survey_sample_site.survey_sample_site_name',
        'w_survey_sample_method.survey_sample_method_name',
        'w_survey_sample_period.survey_sample_period_start_datetime',
        knex.raw(`COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts`)
      )
      .from('survey_observation')
      .leftJoin(
        'w_survey_sample_site',
        'survey_observation.survey_sample_site_id',
        'w_survey_sample_site.survey_sample_site_id'
      )
      .leftJoin(
        'w_survey_sample_method',
        'survey_observation.survey_sample_method_id',
        'w_survey_sample_method.survey_sample_method_id'
      )
      .leftJoin(
        'w_survey_sample_period',
        'survey_observation.survey_sample_period_id',
        'w_survey_sample_period.survey_sample_period_id'
      )
      // Note: inner join requires every observation record to have at least one subcount record, otherwise use left join
      .innerJoin('w_subcounts', 'w_subcounts.survey_observation_id', 'survey_observation.survey_observation_id')
      .whereIn('survey_observation.survey_id', getSurveyIdsQuery)
  );

  //   return knex
  //     .with(
  //       'w_survey_sample_site',
  //       knex
  //         .select('survey_sample_site_id', 'name as survey_sample_site_name')
  //         .from('survey_sample_site')
  //         .whereIn('survey_id', userSurveyIds)
  //     )
  //     .with(
  //       'w_survey_sample_method',
  //       knex
  //         .select(
  //           'survey_sample_method.survey_sample_site_id',
  //           'survey_sample_method.survey_sample_method_id',
  //           'method_lookup.name as survey_sample_method_name'
  //         )
  //         .from('survey_sample_method')
  //         .innerJoin('method_lookup', 'survey_sample_method.method_lookup_id', 'method_lookup.method_lookup_id')
  //         .innerJoin(
  //           'w_survey_sample_site',
  //           'survey_sample_method.survey_sample_site_id',
  //           'w_survey_sample_site.survey_sample_site_id'
  //         )
  //     )
  //     .with(
  //       'w_survey_sample_period',
  //       knex
  //         .select(
  //           'w_survey_sample_method.survey_sample_site_id',
  //           'survey_sample_period.survey_sample_method_id',
  //           'survey_sample_period.survey_sample_period_id',
  //           knex.raw(
  //             `(survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime`
  //           )
  //         )
  //         .from('survey_sample_period')
  //         .innerJoin(
  //           'w_survey_sample_method',
  //           'survey_sample_period.survey_sample_method_id',
  //           'w_survey_sample_method.survey_sample_method_id'
  //         )
  //     )
  //     .with(
  //       'w_qualitative_measurements',
  //       knex
  //         .select(
  //           'observation_subcount_id',
  //           knex.raw(`
  //           json_agg(json_build_object(
  //             'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
  //             'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
  //           )) as qualitative_measurements
  //         `)
  //         )
  //         .from('observation_subcount_qualitative_measurement')
  //         .groupBy('observation_subcount_id')
  //     )
  //     .with(
  //       'w_quantitative_measurements',
  //       knex
  //         .select(
  //           'observation_subcount_id',
  //           knex.raw(`
  //           json_agg(json_build_object(
  //             'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
  //             'value', value
  //           )) as quantitative_measurements
  //         `)
  //         )
  //         .from('observation_subcount_quantitative_measurement')
  //         .groupBy('observation_subcount_id')
  //     )
  //     .with(
  //       'w_qualitative_environments',
  //       knex
  //         .select(
  //           'observation_subcount_id',
  //           knex.raw(`
  //           json_agg(json_build_object(
  //             'observation_subcount_qualitative_environment_id', observation_subcount_qualitative_environment_id,
  //             'environment_qualitative_id', environment_qualitative_id,
  //             'environment_qualitative_option_id', environment_qualitative_option_id
  //           )) as qualitative_environments
  //         `)
  //         )
  //         .from('observation_subcount_qualitative_environment')
  //         .groupBy('observation_subcount_id')
  //     )
  //     .with(
  //       'w_quantitative_environments',
  //       knex
  //         .select(
  //           'observation_subcount_id',
  //           knex.raw(`
  //           json_agg(json_build_object(
  //             'observation_subcount_quantitative_environment_id', observation_subcount_quantitative_environment_id,
  //             'environment_quantitative_id', environment_quantitative_id,
  //             'value', value
  //           )) as quantitative_environments
  //         `)
  //         )
  //         .from('observation_subcount_quantitative_environment')
  //         .groupBy('observation_subcount_id')
  //     )
  //     .with(
  //       'w_subcounts',
  //       knex
  //         .select(
  //           'survey_observation_id',
  //           knex.raw(`
  //           json_agg(json_build_object(
  //             'observation_subcount_id', observation_subcount.observation_subcount_id,
  //             'subcount', subcount,
  //             'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
  //             'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json),
  //             'qualitative_environments', COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json),
  //             'quantitative_environments', COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json)
  //           )) as subcounts
  //         `)
  //         )
  //         .from('observation_subcount')
  //         .leftJoin(
  //           'w_qualitative_measurements',
  //           'observation_subcount.observation_subcount_id',
  //           'w_qualitative_measurements.observation_subcount_id'
  //         )
  //         .leftJoin(
  //           'w_quantitative_measurements',
  //           'observation_subcount.observation_subcount_id',
  //           'w_quantitative_measurements.observation_subcount_id'
  //         )
  //         .leftJoin(
  //           'w_qualitative_environments',
  //           'observation_subcount.observation_subcount_id',
  //           'w_qualitative_environments.observation_subcount_id'
  //         )
  //         .leftJoin(
  //           'w_quantitative_environments',
  //           'observation_subcount.observation_subcount_id',
  //           'w_quantitative_environments.observation_subcount_id'
  //         )
  //         .whereIn(
  //           'survey_observation_id',
  //           knex('survey_observation').select('survey_observation_id').whereIn('survey_id', userSurveyIds)
  //         )
  //         .groupBy('survey_observation_id')
  //     )
  //     .select(
  //       'survey_observation.survey_observation_id',
  //       'survey_observation.survey_id',
  //       'survey_observation.itis_tsn',
  //       'survey_observation.itis_scientific_name',
  //       'survey_observation.survey_sample_site_id',
  //       'survey_observation.survey_sample_method_id',
  //       'survey_observation.survey_sample_period_id',
  //       'survey_observation.latitude',
  //       'survey_observation.longitude',
  //       'survey_observation.count',
  //       'survey_observation.observation_date',
  //       'survey_observation.observation_time',
  //       'w_survey_sample_site.survey_sample_site_name',
  //       'w_survey_sample_method.survey_sample_method_name',
  //       'w_survey_sample_period.survey_sample_period_start_datetime',
  //       knex.raw(`COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts`)
  //     )
  //     .from('survey_observation')
  //     .leftJoin(
  //       'w_survey_sample_site',
  //       'survey_observation.survey_sample_site_id',
  //       'w_survey_sample_site.survey_sample_site_id'
  //     )
  //     .leftJoin(
  //       'w_survey_sample_method',
  //       'survey_observation.survey_sample_method_id',
  //       'w_survey_sample_method.survey_sample_method_id'
  //     )
  //     .leftJoin(
  //       'w_survey_sample_period',
  //       'survey_observation.survey_sample_period_id',
  //       'w_survey_sample_period.survey_sample_period_id'
  //     )
  //     .innerJoin('w_subcounts', 'w_subcounts.survey_observation_id', 'survey_observation.survey_observation_id')
  //     .whereIn('survey_observation.survey_id', userSurveyIds);
}
