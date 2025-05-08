import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { FindSurveyHabitatFeatureAdvancedFilters } from './survey-habitat-feature-repository.interface';

/**
 * Generate a query to find survey habitat feature records for the current user, based on their permissions and filter
 * criteria.
 *
 * @export
 * @param {boolean} isUserAdmin
 * @param {(number | null)} systemUserId
 * @param {FindSurveyHabitatFeatureAdvancedFilters} [filterFields]
 * @return {*}  {Knex.QueryBuilder}
 */
export function makeFindSurveyHabitatFeaturesQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: FindSurveyHabitatFeatureAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  // Get survey IDs query
  const getSurveyIdsQuery = makeFindSurveyIdsQuery(isUserAdmin, systemUserId, filterFields);

  // Get base query
  const getSurveyHabitatFeaturesQuery = getSurveyHabitatFeaturesBaseQuery(knex, getSurveyIdsQuery);

  // Append filter fields
  appendFindSurveyHabitatFeaturesFilterFIelds(getSurveyHabitatFeaturesQuery, filterFields);

  return getSurveyHabitatFeaturesQuery;
}

/**
 * Generate a query to find survey habitat feature records for the current user, based on their permissions and filter
 * criteria.
 *
 * @export
 * @param {boolean} isUserAdmin
 * @param {(number | null)} systemUserId
 * @param {FindSurveyHabitatFeatureAdvancedFilters} [filterFields]
 * @return {*}  {Knex.QueryBuilder}
 */
function makeFindSurveyIdsQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: FindSurveyHabitatFeatureAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const getSurveyIdsQuery = knex.select<any, { survey_id: number }>(['survey_id']).from('survey');

  // Ensure that users can only see survey habitat feature records that they are participating in, unless they are an
  // administrator.
  if (!isUserAdmin) {
    getSurveyIdsQuery.whereIn('survey.project_id', (subqueryBuilder) =>
      subqueryBuilder
        .select('project.project_id')
        .from('project')
        .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
        .where('project_participation.system_user_id', systemUserId)
    );
  }

  if (filterFields?.system_user_id) {
    getSurveyIdsQuery.whereIn('p.project_id', (subQueryBuilder) => {
      subQueryBuilder
        .select('project_id')
        .from('project_participation')
        .where('system_user_id', filterFields.system_user_id);
    });
  }

  return getSurveyIdsQuery;
}

/**
 * Append filter fields to the query for finding survey habitat feature records.
 *
 * @export
 * @param {Knex.QueryBuilder<any, any>} getSurveyHabitatFeaturesQuery
 * @param {FindSurveyHabitatFeatureAdvancedFilters} [filterFields]
 */
function appendFindSurveyHabitatFeaturesFilterFIelds(
  getSurveyHabitatFeaturesQuery: Knex.QueryBuilder<any, any>,
  filterFields?: FindSurveyHabitatFeatureAdvancedFilters
) {
  if (filterFields?.keyword || filterFields?.habitat_feature_type_ids?.length) {
    // Keyword filter
    if (filterFields?.keyword) {
      getSurveyHabitatFeaturesQuery
        .leftJoin(
          'habitat_feature_type',
          'habitat_feature_type.habitat_feature_type_id',
          'survey_habitat_feature.habitat_feature_type_id'
        )
        .where((qb) => {
          qb.orWhere('habitat_feature_type.name', 'ilike', `%${filterFields.keyword}%`).orWhere(
            'habitat_feature_type.description',
            'ilike',
            `%${filterFields.keyword}%`
          );
        });
    }

    // Habitat Feature ID filter
    if (filterFields?.habitat_feature_type_ids?.length) {
      getSurveyHabitatFeaturesQuery.whereIn(
        'survey_habitat_feature.habitat_feature_type_id',
        filterFields.habitat_feature_type_ids
      );
    }
  }

  // Focal Species filter
  if (filterFields?.itis_tsns?.length) {
    getSurveyHabitatFeaturesQuery.whereIn('survey_habitat_feature_taxon.itis_tsn', filterFields.itis_tsns);
  }

  if (filterFields?.min_count) {
    getSurveyHabitatFeaturesQuery.andWhere('survey_habitat_feature.count', '>=', filterFields.min_count);
  }

  if (filterFields?.start_date) {
    getSurveyHabitatFeaturesQuery.andWhere('survey_habitat_feature.observed_date', '>=', filterFields.start_date);
  }

  if (filterFields?.end_date) {
    getSurveyHabitatFeaturesQuery.andWhere('survey_habitat_feature.observed_date', '<=', filterFields.end_date);
  }

  if (filterFields?.start_time) {
    getSurveyHabitatFeaturesQuery.andWhere('survey_habitat_feature.observed_time', '>=', filterFields.start_time);
  }

  if (filterFields?.end_time) {
    getSurveyHabitatFeaturesQuery.andWhere('survey_habitat_feature.observed_time', '<=', filterFields.end_time);
  }
}

/**
 * Get the base query for retrieving survey habitat feature records.
 *
 * TODO: Add quantitative/qualitative values to the query.
 *
 * @export
 * @param {Knex} knex
 * @param {Knex.QueryBuilder<any, { survey_id: number }>} getSurveyIdsQuery
 * @return {*}  {Knex.QueryBuilder}
 */
export function getSurveyHabitatFeaturesBaseQuery(
  knex: Knex,
  getSurveyIdsQuery: Knex.QueryBuilder<any, { survey_id: number }>
): Knex.QueryBuilder {
  return (
    knex
      // Get all sampling information (sites, periods, techniques) for the matching observations
      .with(
        'w_sampling_data',
        knex
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
          .leftJoin(
            'method_technique',
            'method_technique.method_technique_id',
            'survey_sample_period.method_technique_id'
          )
          .whereIn('survey_sample_period.survey_id', getSurveyIdsQuery)
      )
      .select([
        'survey_habitat_feature.survey_habitat_feature_id',
        'survey_habitat_feature.survey_id',
        'survey_habitat_feature.habitat_feature_type_id',
        'habitat_feature_type.name as habitat_feature_type_name',
        'survey_habitat_feature.count',
        'survey_habitat_feature.latitude',
        'survey_habitat_feature.longitude',
        'survey_habitat_feature.observed_date',
        'survey_habitat_feature.observed_time',
        // Period data
        'survey_habitat_feature.survey_sample_period_id',
        'w_sampling_data.survey_sample_period_start_datetime',
        // Site data
        'w_sampling_data.survey_sample_site_id',
        'w_sampling_data.survey_sample_site_name',
        // Technique data
        'w_sampling_data.method_technique_id',
        'w_sampling_data.method_technique_name',
        // Taxon data
        knex.raw(`
          COALESCE(
            (
              json_agg(
                json_build_object(
                  'survey_habitat_feature_taxon_id', survey_habitat_feature_taxon.survey_habitat_feature_taxon_id,
                  'survey_habitat_feature_id', survey_habitat_feature_taxon.survey_habitat_feature_id,
                  'itis_tsn', survey_habitat_feature_taxon.itis_tsn,
                  'itis_scientific_name', survey_habitat_feature_taxon.itis_scientific_name,
                  'comment', survey_habitat_feature_taxon.comment
                )
              ) FILTER (WHERE survey_habitat_feature_taxon.survey_habitat_feature_taxon_id IS NOT NULL)
            ),
            '[]'::json
          ) AS survey_habitat_feature_taxons
        `)
      ])
      .from('survey_habitat_feature')
      .leftJoin(
        'survey_habitat_feature_taxon',
        'survey_habitat_feature_taxon.survey_habitat_feature_id',
        'survey_habitat_feature.survey_habitat_feature_id'
      )
      .leftJoin(
        'w_sampling_data',
        'survey_habitat_feature.survey_sample_period_id',
        'w_sampling_data.survey_sample_period_id'
      )
      // Add join to habitat_feature_type to get the name
      .leftJoin(
        'habitat_feature_type',
        'habitat_feature_type.habitat_feature_type_id',
        'survey_habitat_feature.habitat_feature_type_id'
      )
      .whereIn('survey_habitat_feature.survey_id', getSurveyIdsQuery)
      .groupBy([
        'survey_habitat_feature.survey_habitat_feature_id',
        'survey_habitat_feature.survey_id',
        'survey_habitat_feature.habitat_feature_type_id',
        'survey_habitat_feature.count',
        'survey_habitat_feature.latitude',
        'survey_habitat_feature.longitude',
        'survey_habitat_feature.observed_date',
        'survey_habitat_feature.observed_time',
        // Period data
        'survey_habitat_feature.survey_sample_period_id',
        'w_sampling_data.survey_sample_period_start_datetime',
        // Site data
        'w_sampling_data.survey_sample_site_id',
        'w_sampling_data.survey_sample_site_name',
        // Technique data
        'w_sampling_data.method_technique_id',
        'w_sampling_data.method_technique_name',
        // Add group by for habitat_feature_type.name
        'habitat_feature_type.name'
      ])
  );
}
