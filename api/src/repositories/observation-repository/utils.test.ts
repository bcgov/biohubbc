import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getKnex } from '../../database/db';
import { getSurveyObservationsBaseQuery, makeFindObservationsQuery } from './utils';

chai.use(sinonChai);

describe('Utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('makeFindObservationsQuery', () => {
    it('should return a knex query builder when no optional fields provided', async () => {
      const isUserAdmin = false;
      const systemUserId = null;
      const filterFields = {};

      const queryBuilder = makeFindObservationsQuery(isUserAdmin, systemUserId, filterFields);

      const normalize = (str: string) => {
        // Remove all redundant whitespace and redeuce to one line, to make string comparison easier
        return str.replace(/\s+/g, ' ').trim().replace('/\n/g', ' ').trim();
      };

      expect(normalize(queryBuilder.toSQL().toNative().sql)).to.equal(
        normalize(`with "w_survey_sample_site" as (select "survey_sample_site_id", "name" as "survey_sample_site_name" from "survey_sample_site" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null))), "w_survey_sample_method" as (select "survey_sample_method"."survey_sample_site_id", "survey_sample_method"."survey_sample_method_id", "method_technique"."name" as "survey_sample_method_name" from "survey_sample_method" inner join "method_technique" on "survey_sample_method"."method_technique_id" = "method_technique"."method_technique_id" inner join "w_survey_sample_site" on "survey_sample_method"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id"), "w_survey_sample_period" as (select "w_survey_sample_method"."survey_sample_site_id", "survey_sample_period"."survey_sample_method_id", "survey_sample_period"."survey_sample_period_id", (survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime from "survey_sample_period" inner join "w_survey_sample_method" on "survey_sample_period"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id"), "w_qualitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                       'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                       'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
                   )) as qualitative_measurements
                   from "observation_subcount_qualitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null)))) group by "observation_subcount_id"), "w_quantitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                       'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                       'value', value
                   )) as quantitative_measurements
                   from "observation_subcount_quantitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null)))) group by "observation_subcount_id"), "w_qualitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                       'observation_subcount_qualitative_environment_id', observation_subcount_qualitative_environment_id,
                       'environment_qualitative_id', environment_qualitative_id,
                       'environment_qualitative_option_id', environment_qualitative_option_id
                   )) as qualitative_environments
                   from "observation_subcount_qualitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null)))) group by "observation_subcount_id"), "w_quantitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                       'observation_subcount_quantitative_environment_id', observation_subcount_quantitative_environment_id,
                       'environment_quantitative_id', environment_quantitative_id,
                       'value', value
                   )) as quantitative_environments
                   from "observation_subcount_quantitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null)))) group by "observation_subcount_id"), "w_subcounts" as (select "survey_observation_id",
                   json_agg(json_build_object(
                       'observation_subcount_id', observation_subcount.observation_subcount_id,
                       'observation_subcount_sign_id', observation_subcount.observation_subcount_sign_id,
                       'subcount', subcount,
                       'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
                       'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json),
                       'qualitative_environments', COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json),
                       'quantitative_environments', COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json)
                   )) as subcounts
                   from "observation_subcount" left join "w_qualitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_qualitative_measurements"."observation_subcount_id" left join "w_quantitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_quantitative_measurements"."observation_subcount_id" left join "w_qualitative_environments" on "observation_subcount"."observation_subcount_id" = "w_qualitative_environments"."observation_subcount_id" left join "w_quantitative_environments" on "observation_subcount"."observation_subcount_id" = "w_quantitative_environments"."observation_subcount_id" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null))) group by "survey_observation_id") select "survey_observation"."survey_observation_id", "survey_observation"."survey_id", "survey_observation"."itis_tsn", "survey_observation"."itis_scientific_name", "survey_observation"."survey_sample_site_id", "survey_observation"."survey_sample_method_id", "survey_observation"."survey_sample_period_id", "survey_observation"."latitude", "survey_observation"."longitude", "survey_observation"."count", "survey_observation"."observation_date", "survey_observation"."observation_time", "w_survey_sample_site"."survey_sample_site_name", "w_survey_sample_method"."survey_sample_method_name", "w_survey_sample_period"."survey_sample_period_start_datetime", COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts from "survey_observation" left join "w_survey_sample_site" on "survey_observation"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id" left join "w_survey_sample_method" on "survey_observation"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id" left join "w_survey_sample_period" on "survey_observation"."survey_sample_period_id" = "w_survey_sample_period"."survey_sample_period_id" inner join "w_subcounts" on "w_subcounts"."survey_observation_id" = "survey_observation"."survey_observation_id" where "survey_observation"."survey_id" in (select "survey_id" from "survey" where "survey"."project_id" in (select "project"."project_id" from "project" left join "project_participation" on "project_participation"."project_id" = "project"."project_id" where "project_participation"."system_user_id" is null))`)
      );
      expect(queryBuilder.toSQL().toNative().bindings).to.eql([]);
    });

    it('should return a knex query builder when all optional fields provided', async () => {
      const isUserAdmin = true;
      const systemUserId = 11;
      const filterFields = {
        keyword: 'caribou',
        itis_tsns: [123456],
        itis_tsn: 123456,
        start_date: '2021-01-01',
        end_date: '2024-01-01',
        start_time: '00:00:00',
        end_time: '23:59:59',
        min_count: 0,
        system_user_id: 22
      };

      const queryBuilder = makeFindObservationsQuery(isUserAdmin, systemUserId, filterFields);

      const normalize = (str: string) => {
        // Remove all redundant whitespace and redeuce to one line, to make string comparison easier
        return str.replace(/\s+/g, ' ').trim().replace('/\n/g', ' ').trim();
      };

      expect(normalize(queryBuilder.toSQL().toNative().sql)).to.equal(
        normalize(`with "w_survey_sample_site" as (select "survey_sample_site_id", "name" as "survey_sample_site_name" from "survey_sample_site" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $1))), "w_survey_sample_method" as (select "survey_sample_method"."survey_sample_site_id", "survey_sample_method"."survey_sample_method_id", "method_technique"."name" as "survey_sample_method_name" from "survey_sample_method" inner join "method_technique" on "survey_sample_method"."method_technique_id" = "method_technique"."method_technique_id" inner join "w_survey_sample_site" on "survey_sample_method"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id"), "w_survey_sample_period" as (select "w_survey_sample_method"."survey_sample_site_id", "survey_sample_period"."survey_sample_method_id", "survey_sample_period"."survey_sample_period_id", (survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime from "survey_sample_period" inner join "w_survey_sample_method" on "survey_sample_period"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id"), "w_qualitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                     'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
                   )) as qualitative_measurements
                  from "observation_subcount_qualitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $2)))) group by "observation_subcount_id"), "w_quantitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                     'value', value
                   )) as quantitative_measurements
                  from "observation_subcount_quantitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $3)))) group by "observation_subcount_id"), "w_qualitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'observation_subcount_qualitative_environment_id', observation_subcount_qualitative_environment_id,
                     'environment_qualitative_id', environment_qualitative_id,
                     'environment_qualitative_option_id', environment_qualitative_option_id
                   )) as qualitative_environments
                  from "observation_subcount_qualitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $4)))) group by "observation_subcount_id"), "w_quantitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'observation_subcount_quantitative_environment_id', observation_subcount_quantitative_environment_id,
                     'environment_quantitative_id', environment_quantitative_id,
                     'value', value
                   )) as quantitative_environments
                  from "observation_subcount_quantitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $5)))) group by "observation_subcount_id"), "w_subcounts" as (select "survey_observation_id",
                   json_agg(json_build_object(
                     'observation_subcount_id', observation_subcount.observation_subcount_id,
                     'observation_subcount_sign_id', observation_subcount.observation_subcount_sign_id,
                     'subcount', subcount,
                     'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
                     'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json),
                     'qualitative_environments', COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json),
                     'quantitative_environments', COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json)
                   )) as subcounts
                  from "observation_subcount" left join "w_qualitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_qualitative_measurements"."observation_subcount_id" left join "w_quantitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_quantitative_measurements"."observation_subcount_id" left join "w_qualitative_environments" on "observation_subcount"."observation_subcount_id" = "w_qualitative_environments"."observation_subcount_id" left join "w_quantitative_environments" on "observation_subcount"."observation_subcount_id" = "w_quantitative_environments"."observation_subcount_id" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $6))) group by "survey_observation_id") select "survey_observation"."survey_observation_id", "survey_observation"."survey_id", "survey_observation"."itis_tsn", "survey_observation"."itis_scientific_name", "survey_observation"."survey_sample_site_id", "survey_observation"."survey_sample_method_id", "survey_observation"."survey_sample_period_id", "survey_observation"."latitude", "survey_observation"."longitude", "survey_observation"."count", "survey_observation"."observation_date", "survey_observation"."observation_time", "w_survey_sample_site"."survey_sample_site_name", "w_survey_sample_method"."survey_sample_method_name", "w_survey_sample_period"."survey_sample_period_start_datetime", COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts from "survey_observation" left join "w_survey_sample_site" on "survey_observation"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id" left join "w_survey_sample_method" on "survey_observation"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id" left join "w_survey_sample_period" on "survey_observation"."survey_sample_period_id" = "w_survey_sample_period"."survey_sample_period_id" inner join "w_subcounts" on "w_subcounts"."survey_observation_id" = "survey_observation"."survey_observation_id" where "survey_observation"."survey_id" in (select "survey_id" from "survey" where "p"."project_id" in (select "project_id" from "project_participation" where "system_user_id" = $7)) and "observation_date" >= $8 and "observation_date" <= $9 and ("itis_scientific_name" ilike $10) and "time" >= $11 and "time" <= $12 and "itis_tsn" in ($13)`)
      );
      expect(queryBuilder.toSQL().toNative().bindings).to.eql([
        22,
        22,
        22,
        22,
        22,
        22,
        22,
        '2021-01-01',
        '2024-01-01',
        '%caribou%',
        '00:00:00',
        '23:59:59',
        123456
      ]);
    });
  });

  describe('getSurveyObservationsBaseQuery', () => {
    it('should return a knex query builder', async () => {
      const surveyId = 1;

      const knex = getKnex();
      const getSurveyIdsQuery = knex
        .select<any, { survey_id: number }>('survey_id')
        .from('survey')
        .where('survey_id', surveyId);

      const queryBuilder = getSurveyObservationsBaseQuery(knex, getSurveyIdsQuery);

      const normalize = (str: string) => {
        // Remove all whitespace and trim, to make string comparison easier
        return str.replace(/\s+/g, ' ').trim();
      };

      expect(normalize(queryBuilder.toSQL().toNative().sql)).to.equal(
        normalize(`with "w_survey_sample_site" as (select "survey_sample_site_id", "name" as "survey_sample_site_name" from "survey_sample_site" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $1)), "w_survey_sample_method" as (select "survey_sample_method"."survey_sample_site_id", "survey_sample_method"."survey_sample_method_id", "method_technique"."name" as "survey_sample_method_name" from "survey_sample_method" inner join "method_technique" on "survey_sample_method"."method_technique_id" = "method_technique"."method_technique_id" inner join "w_survey_sample_site" on "survey_sample_method"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id"), "w_survey_sample_period" as (select "w_survey_sample_method"."survey_sample_site_id", "survey_sample_period"."survey_sample_method_id", "survey_sample_period"."survey_sample_period_id", (survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime from "survey_sample_period" inner join "w_survey_sample_method" on "survey_sample_period"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id"), "w_qualitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                     'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
                   )) as qualitative_measurements
                  from "observation_subcount_qualitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $2))) group by "observation_subcount_id"), "w_quantitative_measurements" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'critterbase_taxon_measurement_id', critterbase_taxon_measurement_id,
                     'value', value
                   )) as quantitative_measurements
                  from "observation_subcount_quantitative_measurement" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $3))) group by "observation_subcount_id"), "w_qualitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'observation_subcount_qualitative_environment_id', observation_subcount_qualitative_environment_id,
                     'environment_qualitative_id', environment_qualitative_id,
                     'environment_qualitative_option_id', environment_qualitative_option_id
                   )) as qualitative_environments
                  from "observation_subcount_qualitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $4))) group by "observation_subcount_id"), "w_quantitative_environments" as (select "observation_subcount_id",
                   json_agg(json_build_object(
                     'observation_subcount_quantitative_environment_id', observation_subcount_quantitative_environment_id,
                     'environment_quantitative_id', environment_quantitative_id,
                     'value', value
                   )) as quantitative_environments
                  from "observation_subcount_quantitative_environment" where "observation_subcount_id" in (select "observation_subcount_id" from "observation_subcount" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $5))) group by "observation_subcount_id"), "w_subcounts" as (select "survey_observation_id",
                   json_agg(json_build_object(
                     'observation_subcount_id', observation_subcount.observation_subcount_id,
                     'observation_subcount_sign_id', observation_subcount.observation_subcount_sign_id,
                     'subcount', subcount,
                     'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
                     'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json),
                     'qualitative_environments', COALESCE(w_qualitative_environments.qualitative_environments, '[]'::json),
                     'quantitative_environments', COALESCE(w_quantitative_environments.quantitative_environments, '[]'::json)
                   )) as subcounts
                  from "observation_subcount" left join "w_qualitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_qualitative_measurements"."observation_subcount_id" left join "w_quantitative_measurements" on "observation_subcount"."observation_subcount_id" = "w_quantitative_measurements"."observation_subcount_id" left join "w_qualitative_environments" on "observation_subcount"."observation_subcount_id" = "w_qualitative_environments"."observation_subcount_id" left join "w_quantitative_environments" on "observation_subcount"."observation_subcount_id" = "w_quantitative_environments"."observation_subcount_id" where "survey_observation_id" in (select "survey_observation_id" from "survey_observation" where "survey_id" in (select "survey_id" from "survey" where "survey_id" = $6)) group by "survey_observation_id") select "survey_observation"."survey_observation_id", "survey_observation"."survey_id", "survey_observation"."itis_tsn", "survey_observation"."itis_scientific_name", "survey_observation"."survey_sample_site_id", "survey_observation"."survey_sample_method_id", "survey_observation"."survey_sample_period_id", "survey_observation"."latitude", "survey_observation"."longitude", "survey_observation"."count", "survey_observation"."observation_date", "survey_observation"."observation_time", "w_survey_sample_site"."survey_sample_site_name", "w_survey_sample_method"."survey_sample_method_name", "w_survey_sample_period"."survey_sample_period_start_datetime", COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts from "survey_observation" left join "w_survey_sample_site" on "survey_observation"."survey_sample_site_id" = "w_survey_sample_site"."survey_sample_site_id" left join "w_survey_sample_method" on "survey_observation"."survey_sample_method_id" = "w_survey_sample_method"."survey_sample_method_id" left join "w_survey_sample_period" on "survey_observation"."survey_sample_period_id" = "w_survey_sample_period"."survey_sample_period_id" inner join "w_subcounts" on "w_subcounts"."survey_observation_id" = "survey_observation"."survey_observation_id" where "survey_observation"."survey_id" in (select "survey_id" from "survey" where "survey_id" = $7)`)
      );
      expect(queryBuilder.toSQL().toNative().bindings).to.eql([1, 1, 1, 1, 1, 1, 1]);
    });
  });
});
