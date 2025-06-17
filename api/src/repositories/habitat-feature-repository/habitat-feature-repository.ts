import { getKnex } from '../../database/db';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import {
  FindHabitatFeatureDefinitionAdvancedFilters,
  FindHabitatFeatureDefinitions,
  FindHabitatFeatureQualitativeDefinition,
  FindHabitatFeatureQuantitativeDefinition
} from './habitat-feature-repository.interface';

/**
 * Repository class for working with habitat feature records.
 *
 * @export
 * @class HabitatFeatureRepository
 * @extends {BaseRepository}
 */
export class HabitatFeatureRepository extends BaseRepository {
  /**
   * Find habitat feature quantitative definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindHabitatFeatureQuantitativeDefinition[]>}
   * @memberof HabitatFeatureRepository
   */
  async findHabitatFeatureQuantitativeDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindHabitatFeatureQuantitativeDefinition[]> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .select([
        'habitat_feature_quantitative_definition.habitat_feature_quantitative_definition_id',
        'habitat_feature_quantitative_definition.name',
        'habitat_feature_quantitative_definition.description',
        'habitat_feature_quantitative_definition.min',
        'habitat_feature_quantitative_definition.max',
        'habitat_feature_quantitative_definition.unit',
        'habitat_feature_quantitative_definition.record_end_date'
      ])
      .from('habitat_feature_quantitative_definition');

    const searchConditions = [];

    if (filterFields.keywords?.length) {
      for (const keyword of filterFields.keywords) {
        searchConditions.push(
          knex.raw(
            'habitat_feature_quantitative_definition.name ILIKE ? OR habitat_feature_quantitative_definition.description ILIKE ?',
            [`%${keyword}%`, `%${keyword}%`]
          )
        );
      }
    }

    if (searchConditions.length > 0) {
      query.whereRaw(searchConditions.join(' OR '));
    }

    if (filterFields.survey_id || filterFields.itis_tsns?.length) {
      query
        .innerJoin(
          'survey_habitat_feature_quantitative_value',
          'survey_habitat_feature_quantitative_value.habitat_feature_quantitative_definition_id',
          'habitat_feature_quantitative_definition.habitat_feature_quantitative_definition_id'
        )
        .innerJoin(
          'survey_habitat_feature',
          'survey_habitat_feature.survey_habitat_feature_id',
          'survey_habitat_feature_quantitative_value.survey_habitat_feature_id'
        );

      if (filterFields.survey_id) {
        query.where('survey_habitat_feature.survey_id', filterFields.survey_id);
      }

      if (filterFields.itis_tsns) {
        query
          .innerJoin(
            'survey_habitat_feature_taxon',
            'survey_habitat_feature_taxon.survey_habitat_feature_id',
            'survey_habitat_feature.survey_habitat_feature_id'
          )
          .whereIn('survey_habitat_feature_taxon.itis_tsn', filterFields.itis_tsns);
      }
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindHabitatFeatureQuantitativeDefinition);

    return response.rows;
  }

  /**
   * Find habitat feature qualitative definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindHabitatFeatureQualitativeDefinition[]>}
   * @memberof HabitatFeatureRepository
   */
  async findHabitatFeatureQualitativeDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindHabitatFeatureQualitativeDefinition[]> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .select(
        knex.raw(`
          habitat_feature_qualitative_definition.habitat_feature_qualitative_definition_id,
          habitat_feature_qualitative_definition.name,
          habitat_feature_qualitative_definition.description,
          habitat_feature_qualitative_definition.record_end_date,
          coalesce(
            json_agg(
              json_build_object(
                'habitat_feature_qualitative_definition_id', habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_id,
                'habitat_feature_qualitative_definition_option_id', habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_option_id,
                'name', habitat_feature_qualitative_definition_option.name,
                'description', habitat_feature_qualitative_definition_option.description,
                'record_end_date', habitat_feature_qualitative_definition_option.record_end_date
              )
            ) FILTER (WHERE habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_id IS NOT NULL), 
            '[]'::json
          ) as options
        `)
      )
      .from('habitat_feature_qualitative_definition')
      .innerJoin(
        'habitat_feature_qualitative_definition_option',
        'habitat_feature_qualitative_definition.habitat_feature_qualitative_definition_id',
        'habitat_feature_qualitative_definition_option.habitat_feature_qualitative_definition_id'
      )
      .groupBy(['habitat_feature_qualitative_definition.habitat_feature_qualitative_definition_id']);

    const searchConditions = [];

    if (filterFields.keywords?.length) {
      for (const keyword of filterFields.keywords) {
        searchConditions.push(
          knex.raw(
            'habitat_feature_qualitative_definition.name ILIKE ? OR habitat_feature_qualitative_definition.description ILIKE ?',
            [`%${keyword}%`, `%${keyword}%`]
          )
        );
      }
    }

    if (searchConditions.length > 0) {
      query.whereRaw(searchConditions.join(' OR '));
    }

    if (filterFields.survey_id || filterFields.itis_tsns?.length) {
      query
        .innerJoin(
          'survey_habitat_feature_qualitative_value',
          'survey_habitat_feature_qualitative_value.habitat_feature_qualitative_definition_id',
          'habitat_feature_qualitative_definition.habitat_feature_qualitative_definition_id'
        )
        .innerJoin(
          'survey_habitat_feature',
          'survey_habitat_feature.survey_habitat_feature_id',
          'survey_habitat_feature_qualitative_value.survey_habitat_feature_id'
        );

      if (filterFields.survey_id) {
        query.where('survey_habitat_feature.survey_id', filterFields.survey_id);
      }

      if (filterFields.itis_tsns) {
        query
          .innerJoin(
            'survey_habitat_feature_taxon',
            'survey_habitat_feature_taxon.survey_habitat_feature_id',
            'survey_habitat_feature.survey_habitat_feature_id'
          )
          .whereIn('survey_habitat_feature_taxon.itis_tsn', filterFields.itis_tsns);
      }
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindHabitatFeatureQualitativeDefinition);

    return response.rows;
  }

  /**
   * Find habitat feature quantitative and qualitative definitions.
   *
   * @param {FindHabitatFeatureDefinitionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindHabitatFeatureDefinitions>}
   * @memberof HabitatFeatureRepository
   */
  async findHabitatFeatureDefinitions(
    filterFields: FindHabitatFeatureDefinitionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindHabitatFeatureDefinitions> {
    const [quantitativeDefinitions, qualitativeDefinitions] = await Promise.all([
      this.findHabitatFeatureQuantitativeDefinitions(filterFields, pagination),
      this.findHabitatFeatureQualitativeDefinitions(filterFields, pagination)
    ]);

    return {
      habitatFeatureQuantitativeDefinitions: quantitativeDefinitions,
      habitatFeatureQualitativeDefinitions: qualitativeDefinitions
    };
  }
}
