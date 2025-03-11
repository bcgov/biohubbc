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

  // Get base query
  const getSurveyHabitatFeaturesQuery = getSurveyHabitatFeaturesBaseQuery(knex, getSurveyIdsQuery);

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

  return getSurveyHabitatFeaturesQuery;
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
  return knex
    .select([
      'survey_habitat_feature.survey_habitat_feature_id',
      'survey_habitat_feature.survey_id',
      'survey_habitat_feature.habitat_feature_type_id',
      'survey_habitat_feature.count',
      'survey_habitat_feature.latitude',
      'survey_habitat_feature.longitude',
      'survey_habitat_feature.observed_date',
      'survey_habitat_feature.observed_time',
      'survey_habitat_feature.survey_sample_period_id',
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
    .whereIn('survey_habitat_feature.survey_id', getSurveyIdsQuery)
    .groupBy([
      'survey_habitat_feature.survey_habitat_feature_id',
      'survey_habitat_feature.survey_id',
      'survey_habitat_feature.habitat_feature_type_id',
      'survey_habitat_feature.count',
      'survey_habitat_feature.latitude',
      'survey_habitat_feature.longitude',
      'survey_habitat_feature.observed_date',
      'survey_habitat_feature.observed_time'
    ]);
}
