import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';

/**
 * Generate the observation list query based on user access and filters.
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId The system user id of the user making the request
 * @param {IObservationAdvancedFilters} filterFields
 * @return {*}  {Knex.QueryBuilder}
 */
export function makeFindObservationsQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: IObservationAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const authorizedSurveyIdsQuery = _getAuthorizedSurveyIdsQuery(isUserAdmin, systemUserId, filterFields);

  const getObservationsQuery = getSurveyObservationsBaseQuery(knex, authorizedSurveyIdsQuery);

  if (filterFields?.min_count) {
    getObservationsQuery.andWhere('count', '>=', filterFields.min_count);
  }

  if (filterFields?.start_date) {
    getObservationsQuery.andWhere('observation_date', '>=', filterFields.start_date);
  }

  if (filterFields?.end_date) {
    getObservationsQuery.andWhere('observation_date', '<=', filterFields.end_date);
  }

  if (filterFields?.keyword) {
    getObservationsQuery.where((subqueryBuilder) => {
      subqueryBuilder.where('itis_scientific_name', 'ilike', `%${filterFields.keyword}%`);
      if (!isNaN(Number(filterFields.keyword))) {
        subqueryBuilder.orWhere('survey_observation.survey_observation_id', Number(filterFields.keyword));
      }
    });
  }

  if (filterFields?.start_time) {
    getObservationsQuery.andWhere('time', '>=', filterFields.start_time);
  }

  if (filterFields?.end_time) {
    getObservationsQuery.andWhere('time', '<=', filterFields.end_time);
  }

  // Focal Species filter
  if (filterFields?.itis_tsns?.length) {
    // multiple
    getObservationsQuery.whereIn('itis_tsn', filterFields.itis_tsns);
  } else if (filterFields?.itis_tsn) {
    // single
    getObservationsQuery.where('itis_tsn', filterFields.itis_tsn);
  }

  return getObservationsQuery;
}

/**
 * Generate the flattened observation list query based on user access and filters.
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId The system user id of the user making the request
 * @param {IObservationAdvancedFilters} filterFields
 * @return {*}  {Knex.QueryBuilder}
 */
export function makeFindFlattenedObservationsQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: IObservationAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const authorizedSurveyIdsQuery = _getAuthorizedSurveyIdsQuery(isUserAdmin, systemUserId, filterFields);

  const getFlattenedObservationsQuery = getSurveyFlattenedObservationsBaseQuery(knex, authorizedSurveyIdsQuery);

  if (filterFields?.min_count) {
    getFlattenedObservationsQuery.andWhereRaw(knex.raw(`subcount->>subcount >= ${filterFields.min_count}`));
  }

  if (filterFields?.start_date) {
    getFlattenedObservationsQuery.andWhere('observation_date', '>=', filterFields.start_date);
  }

  if (filterFields?.end_date) {
    getFlattenedObservationsQuery.andWhere('observation_date', '<=', filterFields.end_date);
  }

  if (filterFields?.keyword) {
    getFlattenedObservationsQuery.where((subqueryBuilder) => {
      subqueryBuilder.where('itis_scientific_name', 'ilike', `%${filterFields.keyword}%`);
      if (!isNaN(Number(filterFields.keyword))) {
        subqueryBuilder.orWhere('survey_observation.survey_observation_id', Number(filterFields.keyword));
      }
    });
  }

  if (filterFields?.start_time) {
    getFlattenedObservationsQuery.andWhere('time', '>=', filterFields.start_time);
  }

  if (filterFields?.end_time) {
    getFlattenedObservationsQuery.andWhere('time', '<=', filterFields.end_time);
  }

  // Focal Species filter
  if (filterFields?.itis_tsns?.length) {
    // multiple
    getFlattenedObservationsQuery.whereIn('itis_tsn', filterFields.itis_tsns);
  } else if (filterFields?.itis_tsn) {
    // single
    getFlattenedObservationsQuery.where('itis_tsn', filterFields.itis_tsn);
  }

  return getFlattenedObservationsQuery;
}

/**
 * Get the base query for retrieving survey observations with sampling data.
 *
 * @param {Knex} knex The Knex instance.
 * @param {Knex.QueryBuilder} getSurveyIdsQuery A knex query builder that returns a list of survey IDs, which will be
 * used to filter the observations.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey observations, filtered by survey IDs returned by
 * the getSurveyIdsQuery.
 */
export function getSurveyObservationsBaseQuery(
  knex: Knex,
  authorizedSurveyIdsQuery: Knex.QueryBuilder<any, { survey_id: number }>
): Knex.QueryBuilder {
  return (
    knex
      // Get all sampling information (sites, periods, techniques) for the matching observations
      .with('w_sampling_data', _getSamplingDataQuery(authorizedSurveyIdsQuery))
      // Get all qualitative measurements for all subcounts associated to all observations for the survey
      .with('w_qualitative_measurements', _getQualitativeMeasurementsQuery(authorizedSurveyIdsQuery))
      // Get all quantitative measurements for all subcounts associated to all observations for the survey
      .with('w_quantitative_measurements', _getQuantitativeMeasurementsQuery(authorizedSurveyIdsQuery))
      // Get all qualitative environments for all observations associated to the survey
      .with('w_qualitative_environments', _getQualitativeEnvironmentsQuery(authorizedSurveyIdsQuery))
      // Get all quantitative environments for all observations associated to the survey
      .with('w_quantitative_environments', _getQuantitativeEnvironmentsQuery(authorizedSurveyIdsQuery))
      // Rollup the subcount records into an array of objects for each observation
      .with('w_subcounts', _getSubcountsQuery(authorizedSurveyIdsQuery))
      // Return all observations for the surveys, including the additional sampling data, and rolled up subcount data
      .modify(_selectObservationColumns, authorizedSurveyIdsQuery)
  );
}

/**
 * Get the base query for retrieving flattened survey observations with sampling data.
 *
 * @param {Knex} knex The Knex instance.
 * @param {Knex.QueryBuilder} getSurveyIdsQuery A knex query builder that returns a list of survey IDs, which will be
 * used to filter the observations.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey observations, filtered by survey IDs returned by
 * the getSurveyIdsQuery.
 */
export function getSurveyFlattenedObservationsBaseQuery(
  knex: Knex,
  authorizedSurveyIdsQuery: Knex.QueryBuilder<any, { survey_id: number }>
): Knex.QueryBuilder {
  return (
    knex
      // Get all sampling information (sites, periods, techniques) for the matching observations
      .with('w_sampling_data', _getSamplingDataQuery(authorizedSurveyIdsQuery))
      // Get all qualitative measurements for all subcounts associated to all observations for the survey
      .with('w_qualitative_measurements', _getQualitativeMeasurementsQuery(authorizedSurveyIdsQuery))
      // Get all quantitative measurements for all subcounts associated to all observations for the survey
      .with('w_quantitative_measurements', _getQuantitativeMeasurementsQuery(authorizedSurveyIdsQuery))
      // Get all qualitative environments for all observations associated to the survey
      .with('w_qualitative_environments', _getQualitativeEnvironmentsQuery(authorizedSurveyIdsQuery))
      // Get all quantitative environments for all observations associated to the survey
      .with('w_quantitative_environments', _getQuantitativeEnvironmentsQuery(authorizedSurveyIdsQuery))
      // Rollup the subcount records into an array of objects for each observation
      .with('w_subcount', _getFlattenedSubcountsQuery(authorizedSurveyIdsQuery))
      // Return all observations for the surveys, including the additional sampling data, and flattened subcount data
      .modify(_selectFlattenedObservationColumns, authorizedSurveyIdsQuery)
  );
}

function _getSamplingDataQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
    .select(
      // Period data
      'survey_sample_period.survey_sample_period_id',
      knex.raw(
        `(survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime`
      ),
      // Site data
      'survey_sample_period.survey_sample_site_id',
      'survey_sample_site.name as survey_sample_site_name',
      // Technique data
      'survey_sample_period.method_technique_id',
      'method_technique.name as method_technique_name'
    )
    .from('survey_sample_period')
    .leftJoin(
      'survey_sample_site',
      'survey_sample_site.survey_sample_site_id',
      'survey_sample_period.survey_sample_site_id'
    )
    .leftJoin('method_technique', 'method_technique.method_technique_id', 'survey_sample_period.method_technique_id')
    .whereIn('survey_sample_period.survey_id', authorizedSurveyIdsQuery);

  return queryBuilder;
}

function _getQualitativeMeasurementsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
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
          qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', authorizedSurveyIdsQuery);
        });
    })
    .groupBy('observation_subcount_id');

  return queryBuilder;
}

function _getQuantitativeMeasurementsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
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
          qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', authorizedSurveyIdsQuery);
        });
    })
    .groupBy('observation_subcount_id');

  return queryBuilder;
}

function _getQualitativeEnvironmentsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
    .select(
      'survey_observation_id',
      knex.raw(`
        json_agg(json_build_object(
          'observation_environment_qualitative_id', observation_environment_qualitative_id,
          'environment_qualitative_id', environment_qualitative_id,
          'environment_qualitative_option_id', environment_qualitative_option_id
        )) as qualitative_environments
      `)
    )
    .from('observation_environment_qualitative')
    .whereIn('survey_observation_id', (qb1) => {
      qb1.select('survey_observation_id').from('survey_observation').whereIn('survey_id', authorizedSurveyIdsQuery);
    })
    .groupBy('survey_observation_id');

  return queryBuilder;
}

function _getQuantitativeEnvironmentsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
    .select(
      'survey_observation_id',
      knex.raw(`
      json_agg(json_build_object(
        'observation_environment_quantitative_id', observation_environment_quantitative_id,
        'environment_quantitative_id', environment_quantitative_id,
        'value', value
      )) as quantitative_environments
    `)
    )
    .from('observation_environment_quantitative')
    .whereIn('survey_observation_id', (qb1) => {
      qb1.select('survey_observation_id').from('survey_observation').whereIn('survey_id', authorizedSurveyIdsQuery);
    })
    .groupBy('survey_observation_id');

  return queryBuilder;
}

function _getSubcountsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
    .select(
      'survey_observation_id',
      knex.raw(`
      json_agg(json_build_object(
        'observation_subcount_id', observation_subcount.observation_subcount_id,
        'comment', observation_subcount.comment,
        'subcount', subcount,
        'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
        'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json)
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
    .whereIn(
      'survey_observation_id',
      knex('survey_observation').select('survey_observation_id').whereIn('survey_id', authorizedSurveyIdsQuery)
    )
    .groupBy('survey_observation_id');

  return queryBuilder;
}

function _getFlattenedSubcountsQuery(authorizedSurveyIdsQuery: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  const queryBuilder = knex.queryBuilder();

  queryBuilder
    .select(
      'survey_observation_id',
      knex.raw(`
        json_build_object(
          'observation_subcount_id', observation_subcount.observation_subcount_id,
          'comment', observation_subcount.comment,
          'subcount', subcount,
          'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
          'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json)
        ) as subcount
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
    .whereIn(
      'survey_observation_id',
      knex('survey_observation').select('survey_observation_id').whereIn('survey_id', authorizedSurveyIdsQuery)
    );

  return queryBuilder;
}

function _selectObservationColumns(
  queryBuilder: Knex.QueryBuilder,
  authorizedSurveyIdsQuery: Knex.QueryBuilder
): Knex.QueryBuilder {
  const knex = getKnex();

  queryBuilder
    .select(
      // Observation data
      'survey_observation.survey_observation_id',
      'survey_observation.survey_id',
      'survey_observation.itis_tsn',
      'survey_observation.itis_scientific_name',
      'survey_observation.latitude',
      'survey_observation.longitude',
      'survey_observation.count',
      'survey_observation.observation_date',
      'survey_observation.observation_time',
      'survey_observation.observation_sign_id',
      // Observation environment data
      knex.raw(`COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json) as qualitative_environments`),
      knex.raw(
        `COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json) as quantitative_environments`
      ),
      // Observation subcount data
      knex.raw(`COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts`),
      // Site data
      'w_sampling_data.survey_sample_site_id',
      'w_sampling_data.survey_sample_site_name',
      // Technique data
      'w_sampling_data.method_technique_id',
      'w_sampling_data.method_technique_name',
      // Period data
      'w_sampling_data.survey_sample_period_id',
      'w_sampling_data.survey_sample_period_start_datetime'
    )
    .from('survey_observation')
    .leftJoin(
      'w_sampling_data',
      'survey_observation.survey_sample_period_id',
      'w_sampling_data.survey_sample_period_id'
    )
    .leftJoin(
      'w_qualitative_environments',
      'survey_observation.survey_observation_id',
      'w_qualitative_environments.survey_observation_id'
    )
    .leftJoin(
      'w_quantitative_environments',
      'survey_observation.survey_observation_id',
      'w_quantitative_environments.survey_observation_id'
    )
    // Note: inner join requires every observation record to have at least one subcount record, otherwise use left join
    .innerJoin('w_subcounts', 'w_subcounts.survey_observation_id', 'survey_observation.survey_observation_id')
    .whereIn('survey_observation.survey_id', authorizedSurveyIdsQuery);

  return queryBuilder;
}

function _selectFlattenedObservationColumns(
  queryBuilder: Knex.QueryBuilder,
  authorizedSurveyIdsQuery: Knex.QueryBuilder
): Knex.QueryBuilder {
  const knex = getKnex();

  queryBuilder
    .select(
      // Observation data
      'survey_observation.survey_observation_id',
      'survey_observation.survey_id',
      'survey_observation.itis_tsn',
      'survey_observation.itis_scientific_name',
      'survey_observation.latitude',
      'survey_observation.longitude',
      'survey_observation.count',
      'survey_observation.observation_date',
      'survey_observation.observation_time',
      'survey_observation.observation_sign_id',
      // Observation environment data
      knex.raw(`COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json) as qualitative_environments`),
      knex.raw(
        `COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json) as quantitative_environments`
      ),
      // Observation subcount data
      'w_subcount.subcount as subcount',
      // Site data
      'w_sampling_data.survey_sample_site_id',
      'w_sampling_data.survey_sample_site_name',
      // Technique data
      'w_sampling_data.method_technique_id',
      'w_sampling_data.method_technique_name',
      // Period data
      'w_sampling_data.survey_sample_period_id',
      'w_sampling_data.survey_sample_period_start_datetime'
    )
    .from('survey_observation')
    .leftJoin(
      'w_sampling_data',
      'survey_observation.survey_sample_period_id',
      'w_sampling_data.survey_sample_period_id'
    )
    .leftJoin(
      'w_qualitative_environments',
      'survey_observation.survey_observation_id',
      'w_qualitative_environments.survey_observation_id'
    )
    .leftJoin(
      'w_quantitative_environments',
      'survey_observation.survey_observation_id',
      'w_quantitative_environments.survey_observation_id'
    )
    // Note: inner join requires every observation record to have at least one subcount record, otherwise use left join
    .innerJoin('w_subcount', 'w_subcount.survey_observation_id', 'survey_observation.survey_observation_id')
    .whereIn('survey_observation.survey_id', authorizedSurveyIdsQuery);

  return queryBuilder;
}

/**
 * Helper function to generate the query to get the survey IDs that the user is authorized to view.
 *
 * @export
 * @param {boolean} isUserAdmin
 * @param {(number | null)} systemUserId
 * @param {IObservationAdvancedFilters} [filterFields]
 * @return {*}  {Knex.QueryBuilder}
 */
function _getAuthorizedSurveyIdsQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: IObservationAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const authorizedSurveyIdsQuery = knex.select<any, { survey_id: number }>(['survey_id']).from('survey');

  // Ensure that users can only see observations that they are participating in, unless they are an administrator.
  if (!isUserAdmin) {
    authorizedSurveyIdsQuery.whereIn('survey.project_id', (subqueryBuilder) =>
      subqueryBuilder
        .select('project.project_id')
        .from('project')
        .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
        .where('project_participation.system_user_id', systemUserId)
    );
  }

  if (filterFields?.system_user_id) {
    authorizedSurveyIdsQuery.whereIn('p.project_id', (subQueryBuilder) => {
      subQueryBuilder
        .select('project_id')
        .from('project_participation')
        .where('system_user_id', filterFields.system_user_id);
    });
  }

  return authorizedSurveyIdsQuery;
}
