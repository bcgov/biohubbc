import { Knex } from 'knex';

/**
 * Get the base query for retrieving survey observations with sampling data.
 *
 * @param {Knex} knex The Knex instance.
 * @param {Knex.QueryBuilder} getSurveyIdsQuery A knex query builder that returns a list of survey IDs, which will be
 * used to filter the observations.
 * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey observations, filtered by survey IDs returned by
 * the getSurveyIdsQuery.
 */
export function getSamplingLocationBaseQuery(knex: Knex): Knex.QueryBuilder {
  return (
    knex
      .queryBuilder()
      .with('w_method_technique_attractant', (qb) => {
        // Gather technique attractants
        qb.select(
          'mta.method_technique_id',
          knex.raw(`
          json_agg(json_build_object(
            'attractant_lookup_id', mta.attractant_lookup_id
          )) as attractants`)
        )
          .from({ mta: 'method_technique_attractant' })
          .groupBy('mta.method_technique_id');
      })
      .with('w_method_technique', (qb) => {
        // Gather method techniques
        qb.select(
          'mt.method_technique_id',
          knex.raw(`
          json_build_object(
            'method_technique_id', mt.method_technique_id,
            'name', mt.name,
            'description', mt.description,
            'attractants', COALESCE(wmta.attractants, '[]'::json)
          ) as method_technique`)
        )
          .from({ mt: 'method_technique' })
          .leftJoin('w_method_technique_attractant as wmta', 'wmta.method_technique_id', 'mt.method_technique_id');
      })
      .with('w_survey_sample_period', (qb) => {
        // Aggregate sample periods into an array of objects
        qb.select(
          'ssp.survey_sample_method_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_period_id', ssp.survey_sample_period_id,
            'survey_sample_method_id', ssp.survey_sample_method_id,
            'start_date', ssp.start_date,
            'start_time', ssp.start_time,
            'end_date', ssp.end_date,
            'end_time', ssp.end_time
          ) ORDER BY ssp.start_date, ssp.start_time) as sample_periods`)
        )
          .from({ ssp: 'survey_sample_period' })
          .groupBy('ssp.survey_sample_method_id');
      })
      .with('w_survey_sample_method', (qb) => {
        // Aggregate sample methods into an array of objects and include the corresponding sample periods
        qb.select(
          'ssm.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_method_id', ssm.survey_sample_method_id,
            'survey_sample_site_id', ssm.survey_sample_site_id,
            
            'technique', wmt.method_technique,
            'description', ssm.description,
            'sample_periods', COALESCE(wssp.sample_periods, '[]'::json),
            'method_response_metric_id', ssm.method_response_metric_id
          )) as sample_methods`)
        )
          .from({ ssm: 'survey_sample_method' })
          .leftJoin('w_survey_sample_period as wssp', 'wssp.survey_sample_method_id', 'ssm.survey_sample_method_id')
          .leftJoin('w_method_technique as wmt', 'wmt.method_technique_id', 'ssm.method_technique_id')
          .groupBy('ssm.survey_sample_site_id');
      })
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
        COALESCE(wssm.sample_methods, '[]'::json) as sample_methods,
        COALESCE(wssb.blocks, '[]'::json) as blocks,
        COALESCE(wssst.stratums, '[]'::json) as stratums`)
      )
      .from({ sss: 'survey_sample_site' })
      .leftJoin('w_survey_sample_method as wssm', 'wssm.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_block as wssb', 'wssb.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_stratum as wssst', 'wssst.survey_sample_site_id', 'sss.survey_sample_site_id')
  );
}
