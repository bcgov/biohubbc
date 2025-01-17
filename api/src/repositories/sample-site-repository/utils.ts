import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { ISiteAdvancedFilters } from '../../models/site-view';

/**
 * Get the base query for retrieving survey sample sites.
 *
 * @param {Knex} knex The Knex instance.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey sample sites.
 */
export function getSampleSiteBaseQuery(knex: Knex): Knex.QueryBuilder {
  return (
    knex
      .queryBuilder()
      .with('w_survey_sample_block', (qb) => {
        // Aggregate sample blocks into an array of objects
        qb.select(
          'ssb.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_block_id', ssb.survey_sample_block_id,
            'survey_sample_site_id', ssb.survey_sample_site_id,
            'survey_block_id', ssb.survey_block_id,
            'name', sb.name,
            'description', sb.description
          )) as blocks`)
        )
          .from({ ssb: 'survey_sample_block' })
          .leftJoin('survey_block as sb', 'sb.survey_block_id', 'ssb.survey_block_id')
          .groupBy('ssb.survey_sample_site_id');
      })
      .with('w_survey_sample_stratum', (qb) => {
        // Aggregate sample stratums into an array of objects
        qb.select(
          'ssst.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_stratum_id', ssst.survey_sample_stratum_id,
            'survey_sample_site_id', ssst.survey_sample_site_id,
            'survey_stratum_id', ssst.survey_stratum_id,
            'name', ss.name,
            'description', ss.description
          )) as stratums`)
        )
          .from({ ssst: 'survey_sample_stratum' })
          .leftJoin('survey_stratum as ss', 'ss.survey_stratum_id', 'ssst.survey_stratum_id')
          .groupBy('ssst.survey_sample_site_id');
      })
      // Fetch sample sites and include the corresponding sample methods, blocks, and stratums
      .select(
        'sss.survey_sample_site_id',
        'sss.survey_id',
        'sss.name',
        'sss.description',
        'sss.geojson',
        knex.raw(`
          COALESCE(wssb.blocks, '[]'::json) as blocks,
          COALESCE(wssst.stratums, '[]'::json) as stratums`)
      )
      .from({ sss: 'survey_sample_site' })
      //   .leftJoin('w_method_technique as wmt', 'wssm.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_block as wssb', 'wssb.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_stratum as wssst', 'wssst.survey_sample_site_id', 'sss.survey_sample_site_id')
  );
}
/**
 * Get the base query for retrieving survey sample sites.
 *
 * @param {Knex} knex The Knex instance.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey sample sites
 */
export function getSamplingSiteBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
  const knex = getKnex();

  queryBuilder
    .with('w_survey_sample_block', (qb) => {
      // Aggregate sample blocks into an array of objects
      qb.select(
        'ssb.survey_sample_site_id',
        knex.raw(`
        json_agg(json_build_object(
          'survey_sample_block_id', ssb.survey_sample_block_id,
          'survey_sample_site_id', ssb.survey_sample_site_id,
          'survey_block_id', ssb.survey_block_id,
          'name', sb.name,
          'description', sb.description
        )) as blocks`)
      )
        .from({ ssb: 'survey_sample_block' })
        .leftJoin('survey_block as sb', 'sb.survey_block_id', 'ssb.survey_block_id')
        .groupBy('ssb.survey_sample_site_id');
    })
    .with('w_survey_sample_stratum', (qb) => {
      // Aggregate sample stratums into an array of objects
      qb.select(
        'ssst.survey_sample_site_id',
        knex.raw(`
        json_agg(json_build_object(
          'survey_sample_stratum_id', ssst.survey_sample_stratum_id,
          'survey_sample_site_id', ssst.survey_sample_site_id,
          'survey_stratum_id', ssst.survey_stratum_id,
          'name', ss.name,
          'description', ss.description
        )) as stratums`)
      )
        .from({ ssst: 'survey_sample_stratum' })
        .leftJoin('survey_stratum as ss', 'ss.survey_stratum_id', 'ssst.survey_stratum_id')
        .groupBy('ssst.survey_sample_site_id');
    })
    .select(
      'sss.survey_sample_site_id',
      'sss.survey_id',
      'sss.name',
      'sss.description',
      knex.raw(`sss.geojson->'geometry'->>'type' as geometry_type`),
      knex.raw(`
        COALESCE(wssb.blocks, '[]'::json) as blocks,
        COALESCE(wssst.stratums, '[]'::json) as stratums`)
    )
    .from({ sss: 'survey_sample_site' })
    .leftJoin('w_survey_sample_block as wssb', 'wssb.survey_sample_site_id', 'sss.survey_sample_site_id')
    .leftJoin('w_survey_sample_stratum as wssst', 'wssst.survey_sample_site_id', 'sss.survey_sample_site_id');

  return queryBuilder;
}

/**
 * Get the base query for retrieving survey sample sites, including blocks and stratums.
 *
 * @param {Knex} knex The Knex instance.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey sample sites
 */
export function makeFindSamplingSiteBaseQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: ISiteAdvancedFilters
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

  if (filterFields?.system_user_id) {
    getSurveyIdsQuery.whereIn('p.project_id', (subQueryBuilder) => {
      subQueryBuilder
        .select('project_id')
        .from('project_participation')
        .where('system_user_id', filterFields.system_user_id);
    });
  }

  const getSamplingSitesQuery = knex.queryBuilder();

  // Add the base query
  getSamplingSitesQuery.modify(getSamplingSiteBaseQuery);

  // Filter by the survey ids the user has access to
  getSamplingSitesQuery.whereIn('sss.survey_id', getSurveyIdsQuery);

  if (filterFields?.survey_id) {
    // Filter by a specific survey id
    getSamplingSitesQuery.andWhere('sss.survey_id', filterFields.survey_id);
  }

  if (filterFields?.keyword) {
    // Filter by keyword
    getSamplingSitesQuery.where((subqueryBuilder) => {
      subqueryBuilder
        .orWhere('sss.name', 'ilike', `%${filterFields.keyword}%`)
        .orWhere('sss.description', 'ilike', `%${filterFields.keyword}%`);
    });
  }

  return getSamplingSitesQuery;
}
