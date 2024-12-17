import SQL from 'sql-template-strings';
import { z } from 'zod';
import { AttractantLookupRecord } from '../database-models/attractant_lookup';
import { MethodTechniqueRecord } from '../database-models/method_technique';
import { MethodTechniqueAttractantRecord } from '../database-models/method_technique_attractant';
import { MethodTechniqueAttributeQualitativeRecord } from '../database-models/method_technique_attribute_qualitative';
import { MethodTechniqueAttributeQuantitativeRecord } from '../database-models/method_technique_attribute_quantitative';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';
import { TechniqueVantage } from './technique-vantage-repository';

const ITechniquePostData = MethodTechniqueRecord.pick({
  name: true,
  description: true,
  distance_threshold: true,
  method_lookup_id: true
}).extend({
  attributes: z.object({
    quantitative_attributes: z.array(
      MethodTechniqueAttributeQuantitativeRecord.pick({
        method_lookup_attribute_quantitative_id: true,
        value: true
      })
    ),
    qualitative_attributes: z.array(
      MethodTechniqueAttributeQualitativeRecord.pick({
        method_lookup_attribute_qualitative_id: true,
        method_lookup_attribute_qualitative_option_id: true
      })
    )
  }),
  attractants: z.array(
    MethodTechniqueAttractantRecord.pick({
      attractant_lookup_id: true
    })
  ),
  vantage_methods: z.array(TechniqueVantage)
});

export type ITechniquePostData = z.infer<typeof ITechniquePostData>;

const ITechniquePutData = ITechniquePostData.merge(
  MethodTechniqueRecord.pick({
    method_technique_id: true
  })
);

export type ITechniquePutData = z.infer<typeof ITechniquePutData>;

const ITechniqueRowDataForInsert = MethodTechniqueRecord.pick({
  name: true,
  description: true,
  distance_threshold: true,
  method_lookup_id: true
});

export type ITechniqueRowDataForInsert = z.infer<typeof ITechniqueRowDataForInsert>;

const ITechniqueRowDataForUpdate = ITechniqueRowDataForInsert.merge(
  MethodTechniqueRecord.pick({
    method_technique_id: true
  })
);

export type ITechniqueRowDataForUpdate = z.infer<typeof ITechniqueRowDataForUpdate>;

const TechniqueObject = MethodTechniqueRecord.pick({
  method_technique_id: true,
  name: true,
  description: true,
  distance_threshold: true,
  method_lookup_id: true
}).extend({
  attractants: z.array(
    AttractantLookupRecord.pick({
      attractant_lookup_id: true
    })
  ),
  attributes: z.object({
    qualitative_attributes: z.array(
      MethodTechniqueAttributeQualitativeRecord.pick({
        method_technique_attribute_qualitative_id: true,
        method_lookup_attribute_qualitative_id: true,
        method_lookup_attribute_qualitative_option_id: true
      })
    ),
    quantitative_attributes: z.array(
      MethodTechniqueAttributeQuantitativeRecord.pick({
        method_technique_attribute_quantitative_id: true,
        method_lookup_attribute_quantitative_id: true,
        value: true
      })
    )
  }),
  vantage_methods: z.array(TechniqueVantage)
});

export type TechniqueObject = z.infer<typeof TechniqueObject>;

export class TechniqueRepository extends BaseRepository {
  /**
   * Private utility function to generate the common SQL query for fetching method technique records, including
   * associated attractants and attributes.
   *
   * @param {number} surveyId The survey ID
   * @returns {*}
   */
  _generateGetTechniqueQuery(surveyId: number) {
    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_attractants',
        knex
          .select(
            'method_technique_id',
            knex.raw(`
              json_agg(json_build_object(
                'attractant_lookup_id', attractant_lookup_id
              )) AS attractants
            `)
          )
          .from('method_technique_attractant')
          .groupBy('method_technique_id')
      )
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'method_technique_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_technique_attribute_quantitative_id', method_technique_attribute_quantitative_id,
                'method_lookup_attribute_quantitative_id', method_lookup_attribute_quantitative_id,
                'value', value
              )) as quantitative_attributes
            `)
          )
          .from('method_technique_attribute_quantitative')
          .groupBy('method_technique_id')
      )
      .with(
        'w_qualitative_attributes',
        knex
          .select(
            'method_technique_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_technique_attribute_qualitative_id', method_technique_attribute_qualitative_id,
                'method_lookup_attribute_qualitative_id', method_lookup_attribute_qualitative_id,
                'method_lookup_attribute_qualitative_option_id', method_lookup_attribute_qualitative_option_id
              )) as qualitative_attributes
            `)
          )
          .from('method_technique_attribute_qualitative')
          .groupBy('method_technique_id')
      )
      .with(
        'w_vantages',
        knex
          .select(
            'method_technique_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_technique_vantage_id', method_technique_vantage.method_technique_vantage_id,
                'vantage_method_id', method_technique_vantage.vantage_method_id,
                'vantage_category_id', vantage.vantage_category_id
              )) as vantage_methods
            `)
          )
          .from('method_technique_vantage')
          .join('vantage_method', 'vantage_method.vantage_method_id', 'method_technique_vantage.vantage_method_id')
          .join('vantage', 'vantage.vantage_id', 'vantage_method.vantage_id')
          .groupBy('method_technique_id')
      )
      .select(
        'mt.method_technique_id',
        'mt.name',
        'mt.description',
        'mt.distance_threshold',
        'mt.method_lookup_id',
        knex.raw(`
          COALESCE(w_attractants.attractants, '[]'::json) AS attractants
        `),
        knex.raw(`
          json_build_object(
            'quantitative_attributes', COALESCE(w_quantitative_attributes.quantitative_attributes, '[]'::json),
            'qualitative_attributes', COALESCE(w_qualitative_attributes.qualitative_attributes, '[]'::json
          )) AS attributes
        `),
        knex.raw(`
          COALESCE(w_vantages.vantage_methods, '[]'::json) AS vantage_methods
        `)
      )
      .from('method_technique as mt')
      .leftJoin('w_attractants', 'w_attractants.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_quantitative_attributes', 'w_quantitative_attributes.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_qualitative_attributes', 'w_qualitative_attributes.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_vantages', 'w_vantages.method_technique_id', 'mt.method_technique_id')
      .where('mt.survey_id', surveyId);

    return queryBuilder;
  }

  /**
   * Get a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<TechniqueObject>}
   * @memberof TechniqueRepository
   */
  async getTechniqueById(surveyId: number, methodTechniqueId: number): Promise<TechniqueObject> {
    const queryBuilder = this._generateGetTechniqueQuery(surveyId).andWhere(
      'mt.method_technique_id',
      methodTechniqueId
    );

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    return response.rows[0];
  }

  /**
   * Get a paginated list of techniques for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<TechniqueObject[]>}
   * @memberof TechniqueRepository
   */
  async getTechniquesForSurveyId(surveyId: number, pagination?: ApiPaginationOptions): Promise<TechniqueObject[]> {
    const queryBuilder = this._generateGetTechniqueQuery(surveyId);

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    return response.rows;
  }

  /**
   * Get total count of all techniques for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof TechniqueRepository
   */
  async getTechniquesCountForSurveyId(surveyId: number): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(knex.raw('count(*)::integer as count'))
      .from('method_technique as mt')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Create a new technique.
   *
   * @param {number} surveyId
   * @param {number} techniqueObject
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async insertTechnique(
    surveyId: number,
    techniqueObject: ITechniqueRowDataForInsert
  ): Promise<{ method_technique_id: number }> {
    const queryBuilder = getKnex()
      .insert({
        name: techniqueObject.name,
        description: techniqueObject.description,
        distance_threshold: techniqueObject.distance_threshold,
        method_lookup_id: techniqueObject.method_lookup_id,
        survey_id: surveyId
      })
      .into('method_technique')
      .returning('method_technique_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_id: z.number() }));

    return response.rows[0];
  }

  /**
   * Update an existing technique.
   *
   * @param {number} surveyId
   * @param {ITechniqueRowDataForUpdate} techniqueObject
   * @return {*}  {Promise<{ method_technique_id: number }>}
   * @memberof TechniqueRepository
   */
  async updateTechnique(
    surveyId: number,
    techniqueObject: ITechniqueRowDataForUpdate
  ): Promise<{ method_technique_id: number }> {
    const queryBuilder = getKnex()
      .table('method_technique')
      .update({
        name: techniqueObject.name,
        description: techniqueObject.description,
        method_lookup_id: techniqueObject.method_lookup_id,
        distance_threshold: techniqueObject.distance_threshold
      })
      .where('method_technique_id', techniqueObject.method_technique_id)
      .andWhere('survey_id', surveyId)
      .returning('method_technique_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_id: z.number() }));

    return response.rows[0];
  }

  /**
   * Delete a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<{ method_technique_id: number }>}
   * @memberof TechniqueRepository
   */
  async deleteTechnique(surveyId: number, methodTechniqueId: number): Promise<{ method_technique_id: number }> {
    const sqlStatement = SQL`
      DELETE FROM 
        method_technique mt
      WHERE 
        mt.survey_id = ${surveyId} 
      AND
        mt.method_technique_id = ${methodTechniqueId}
      RETURNING
        mt.method_technique_id;
    `;

    const response = await this.connection.sql(
      sqlStatement,
      z.object({
        method_technique_id: z.number()
      })
    );

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete technique', [
        'TechniqueRepository->deleteTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
