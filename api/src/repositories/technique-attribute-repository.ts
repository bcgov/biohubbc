import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/technique-attribute-repository');

export interface IQuantitativeAttributePostData {
  method_technique_attribute_quantitative_id?: number;
  method_lookup_attribute_quantitative_id: string;
  value: number;
}

export interface IQualitativeAttributePostData {
  method_technique_attribute_qualitative_id?: number;
  method_lookup_attribute_qualitative_option_id: string;
  method_lookup_attribute_qualitative_id: string;
}

const TechniqueAttributeQuantitative = z.object({
  method_lookup_attribute_quantitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable()
});

const TechniqueAttributeQualitativeOption = z.object({
  method_lookup_attribute_qualitative_option_id: z.string(),
  name: z.string(),
  description: z.string().nullable()
});

const TechniqueAttributeQualitative = z.object({
  method_lookup_attribute_qualitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  options: z.array(TechniqueAttributeQualitativeOption)
});

export const TechniqueAttributesLookupObject = z.object({
  method_lookup_id: z.number(),
  quantitative_attributes: z.array(TechniqueAttributeQuantitative),
  qualitative_attributes: z.array(TechniqueAttributeQualitative)
});
export type TechniqueAttributesLookupObject = z.infer<typeof TechniqueAttributesLookupObject>;

export const TechniqueAttributesObject = z.object({
  quantitative_attributes: z.array(
    z.object({
      method_technique_attribute_quantitative_id: z.number(),
      method_technique_id: z.number(),
      method_lookup_attribute_quantitative_id: z.string().uuid(),
      value: z.number()
    })
  ),
  qualitative_attributes: z.array(
    z.object({
      method_technique_attribute_qualitative_id: z.number(),
      method_technique_id: z.number(),
      method_lookup_attribute_qualitative_id: z.string().uuid(),
      method_lookup_attribute_qualitative_option_id: z.string()
    })
  )
});
export type TechniqueAttributesObject = z.infer<typeof TechniqueAttributesObject>;

export class TechniqueAttributeRepository extends BaseRepository {
  /**
   * Get quantitative and qualitative attribute definition records for method lookup Ids.
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<TechniqueAttributesLookupObject[]>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributeDefinitionsByMethodLookupIds(
    methodLookupIds: number[]
  ): Promise<TechniqueAttributesLookupObject[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'mlaq.method_lookup_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_quantitative_id', mlaq.method_lookup_attribute_quantitative_id,
                'name', taq.name,
                'description', taq.description,
                'min', mlaq.min,
                'max', mlaq.max,
                'unit', mlaq.unit
              )) as quantitative_attributes
            `)
          )
          .from('method_lookup_attribute_quantitative as mlaq')
          .leftJoin(
            'technique_attribute_quantitative as taq',
            'taq.technique_attribute_quantitative_id',
            'mlaq.technique_attribute_quantitative_id'
          )
          .where('mlaq.record_end_date', null)
          .groupBy('mlaq.method_lookup_id')
      )
      .with(
        'w_qualitative_attributes_options',
        knex
          .select(
            'method_lookup_attribute_qualitative_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_qualitative_option_id', method_lookup_attribute_qualitative_option_id,
                'name', name,
                'description', description
              )) as options
            `)
          )
          .from('method_lookup_attribute_qualitative_option')
          .where('record_end_date', null)
          .groupBy('method_lookup_attribute_qualitative_id')
      )
      .with(
        'w_qualitative_attributes',
        knex
          .select(
            'mlaq.method_lookup_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_qualitative_id', mlaq.method_lookup_attribute_qualitative_id,
                'name', taq.name,
                'description', taq.description,
                'options', COALESCE(wqao.options, '[]'::json)
              )) as qualitative_attributes
            `)
          )
          .from('method_lookup_attribute_qualitative as mlaq')
          .leftJoin(
            'technique_attribute_qualitative as taq',
            'taq.technique_attribute_qualitative_id',
            'mlaq.technique_attribute_qualitative_id'
          )
          .innerJoin(
            'w_qualitative_attributes_options as wqao',
            'wqao.method_lookup_attribute_qualitative_id',
            'mlaq.method_lookup_attribute_qualitative_id'
          )
          .where('mlaq.record_end_date', null)
          .groupBy('mlaq.method_lookup_id')
      )
      .select(
        'ml.method_lookup_id',
        knex.raw(`COALESCE(qual.qualitative_attributes, '[]'::json) as qualitative_attributes`),
        knex.raw(`COALESCE(quant.quantitative_attributes, '[]'::json) as quantitative_attributes`)
      )
      .from('method_lookup as ml')
      .leftJoin('w_qualitative_attributes as qual', 'ml.method_lookup_id', 'qual.method_lookup_id')
      .leftJoin('w_quantitative_attributes as quant', 'ml.method_lookup_id', 'quant.method_lookup_id')
      .whereIn('ml.method_lookup_id', methodLookupIds);

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesLookupObject);

    return response.rows;
  }

  /**
   * Get quantitative and qualitative attribute definition records for a technique Id.
   *
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<TechniqueAttributesLookupObject>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributeDefinitionsByTechniqueId(methodTechniqueId: number): Promise<TechniqueAttributesLookupObject> {
    defaultLog.debug({ label: 'getAttributesForMethodLookupId', methodTechniqueId });

    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'mlaq.method_lookup_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_quantitative_id', mlaq.method_lookup_attribute_quantitative_id,
                'name', taq.name,
                'description', taq.description,
                'min', mlaq.min,
                'max', mlaq.max,
                'unit', mlaq.unit
              )) as quantitative_attributes
            `)
          )
          .from('method_lookup_attribute_quantitative as mlaq')
          .leftJoin(
            'technique_attribute_quantitative as taq',
            'taq.technique_attribute_quantitative_id',
            'mlaq.technique_attribute_quantitative_id'
          )
          .where('mlaq.record_end_date', null)
          .groupBy('mlaq.method_lookup_id')
      )
      .with(
        'w_qualitative_attributes_options',
        knex
          .select(
            'method_lookup_attribute_qualitative_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_qualitative_option_id', method_lookup_attribute_qualitative_option_id,
                'name', name,
                'description', description
              )) as options
            `)
          )
          .from('method_lookup_attribute_qualitative_option')
          .where('record_end_date', null)
          .groupBy('method_lookup_attribute_qualitative_id')
      )
      .with(
        'w_qualitative_attributes',
        knex
          .select(
            'mlaq.method_lookup_id',
            knex.raw(`
              json_agg(json_build_object(
                'method_lookup_attribute_qualitative_id', mlaq.method_lookup_attribute_qualitative_id,
                'name', taq.name,
                'description', taq.description,
                'options', COALESCE(wqao.options, '[]'::json)
              )) as qualitative_attributes
            `)
          )
          .from('method_lookup_attribute_qualitative as mlaq')
          .leftJoin(
            'technique_attribute_qualitative as taq',
            'taq.technique_attribute_qualitative_id',
            'mlaq.technique_attribute_qualitative_id'
          )
          .innerJoin(
            'w_qualitative_attributes_options as wqao',
            'wqao.method_lookup_attribute_qualitative_id',
            'mlaq.method_lookup_attribute_qualitative_id'
          )
          .where('mlaq.record_end_date', null)
          .groupBy('mlaq.method_lookup_id')
      )
      .select(
        'ml.method_lookup_id',
        knex.raw(`COALESCE(qual.qualitative_attributes, '[]'::json) as qualitative_attributes`),
        knex.raw(`COALESCE(quant.quantitative_attributes, '[]'::json) as quantitative_attributes`)
      )
      .from('method_technique as mt')
      .leftJoin('method_lookup as ml', 'ml.method_lookup_id', 'mt.method_lookup_id')
      .leftJoin('w_qualitative_attributes as qual', 'ml.method_lookup_id', 'qual.method_lookup_id')
      .leftJoin('w_quantitative_attributes as quant', 'ml.method_lookup_id', 'quant.method_lookup_id')
      .where('mt.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesLookupObject);

    return response.rows[0];
  }

  /**
   * Get quantitative and qualitative attribute records for a technique Id.
   *
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<TechniqueAttributesObject>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributesByTechniqueId(methodTechniqueId: number): Promise<TechniqueAttributesObject> {
    defaultLog.debug({ label: 'getAttributesByTechniqueId', methodTechniqueId });

    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'method_technique_id',
            knex.raw(`json_agg(json_build_object(
          'method_technique_attribute_quantitative_id', method_technique_attribute_quantitative_id,
          'method_technique_id', method_technique_id,
          'method_lookup_attribute_quantitative_id', method_lookup_attribute_quantitative_id,
          'value', value
        )) as quantitative_attributes`)
          )
          .from('method_technique_attribute_quantitative')
          .groupBy('method_technique_id')
      )
      .with(
        'w_qualitative_attributes',
        knex
          .select(
            'method_technique_id',
            knex.raw(`json_agg(json_build_object(
          'method_technique_attribute_qualitative_id', method_technique_attribute_qualitative_id,
          'method_technique_id', method_technique_id,
          'method_lookup_attribute_qualitative_id', method_lookup_attribute_qualitative_id,
          'method_lookup_attribute_qualitative_option_id', method_lookup_attribute_qualitative_option_id
        )) as qualitative_attributes`)
          )
          .from('method_technique_attribute_qualitative')
          .groupBy('method_technique_id')
      )
      .select(
        knex.raw(`COALESCE(w_quantitative_attributes.quantitative_attributes, '[]'::json) as quantitative_attributes`),
        knex.raw(`COALESCE(w_qualitative_attributes.qualitative_attributes, '[]'::json) as qualitative_attributes`)
      )
      .from('method_technique as mt')
      .leftJoin('w_qualitative_attributes', 'w_qualitative_attributes.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_quantitative_attributes', 'w_quantitative_attributes.method_technique_id', 'mt.method_technique_id')
      .where('mt.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesObject);

    return response.rows[0];
  }

  /**
   * Insert qualitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @return {*}  {(Promise<{ method_technique_attribute_qualitative_id: number }[] | undefined>)}
   * @memberof TechniqueAttributeRepository
   */
  async insertQualitativeAttributesForTechnique(
    methodTechniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<{ method_technique_attribute_qualitative_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertQualitativeAttributesForTechnique', methodTechniqueId });

    if (!attributes.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        attributes.map((attribute) => ({
          method_lookup_attribute_qualitative_id: attribute.method_lookup_attribute_qualitative_id,
          method_lookup_attribute_qualitative_option_id: attribute.method_lookup_attribute_qualitative_option_id,
          method_technique_id: methodTechniqueId
        }))
      )
      .into('method_technique_attribute_qualitative')
      .returning('method_technique_attribute_qualitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_attribute_qualitative_id: z.number() })
    );

    return response.rows;
  }

  /**
   * Insert quantitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @return {*}  {(Promise<{ method_technique_attribute_quantitative_id: number }[] | undefined>)}
   * @memberof TechniqueAttributeRepository
   */
  async insertQuantitativeAttributesForTechnique(
    methodTechniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<{ method_technique_attribute_quantitative_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertQuantitativeAttributesForTechnique', methodTechniqueId });

    if (!attributes.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        attributes.map((attribute) => ({
          method_lookup_attribute_quantitative_id: attribute.method_lookup_attribute_quantitative_id,
          value: attribute.value,
          method_technique_id: methodTechniqueId
        }))
      )
      .into('method_technique_attribute_quantitative')
      .returning('method_technique_attribute_quantitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_attribute_quantitative_id: z.number() })
    );

    return response.rows;
  }

  /**
   * Update quantitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQuantitativeAttributePostData} attribute
   * @return {*}  {Promise<{ method_technique_attribute_quantitative_id: number }>}
   * @memberof TechniqueAttributeRepository
   */
  async updateQuantitativeAttributeForTechnique(
    methodTechniqueId: number,
    attribute: IQuantitativeAttributePostData
  ): Promise<{ method_technique_attribute_quantitative_id: number }> {
    defaultLog.debug({ label: 'updateQuantitativeAttributesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_attribute_quantitative')
      .update({
        method_lookup_attribute_quantitative_id: attribute.method_lookup_attribute_quantitative_id,
        value: attribute.value
      })
      .where('method_technique_attribute_quantitative_id', attribute.method_technique_attribute_quantitative_id)
      .returning('method_technique_attribute_quantitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_attribute_quantitative_id: z.number() })
    );

    return response.rows[0];
  }

  /**
   * Update qualitative attribute records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {IQualitativeAttributePostData} attribute
   * @return {*}  {Promise<{ method_technique_attribute_qualitative_id: number }>}
   * @memberof TechniqueAttributeRepository
   */
  async updateQualitativeAttributeForTechnique(
    methodTechniqueId: number,
    attribute: IQualitativeAttributePostData
  ): Promise<{ method_technique_attribute_qualitative_id: number }> {
    defaultLog.debug({ label: 'updateQualitativeAttributesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_attribute_qualitative')
      .update({
        method_lookup_attribute_qualitative_id: attribute.method_lookup_attribute_qualitative_id,
        method_lookup_attribute_qualitative_option_id: attribute.method_lookup_attribute_qualitative_option_id
      })
      .where('method_technique_attribute_qualitative_id', attribute.method_technique_attribute_qualitative_id)
      .returning('method_technique_attribute_qualitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_attribute_qualitative_id: z.number() })
    );

    return response.rows[0];
  }

  /**
   * Delete qualitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} methodTechniqueAttributeQualitativeIds
   * @return {*}  {Promise<{ method_technique_attribute_qualitative_id: number }[]>}
   * @memberof TechniqueAttributeRepository
   */
  async deleteQualitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    methodTechniqueAttributeQualitativeIds: number[]
  ): Promise<{ method_technique_attribute_qualitative_id: number }[]> {
    defaultLog.debug({ label: 'deleteQualitativeAttributesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .del()
      .from('method_technique_attribute_qualitative as mtaq')
      .leftJoin('method_technique as mt', 'mt.method_technique_id', 'mtaq.method_technique_id')
      .whereIn('method_technique_attribute_qualitative_id', methodTechniqueAttributeQualitativeIds)
      .andWhere('mtaq.method_technique_id', methodTechniqueId)
      .andWhere('mt.survey_id', surveyId)
      .returning('method_technique_attribute_qualitative.method_technique_attribute_qualitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({
        method_technique_attribute_qualitative_id: z.number()
      })
    );

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete qualitative attribute', [
        'TechniqueAttributeRepository->deleteQualitativeAttributesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Delete quantitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} methodTechniqueAttributeQuantitativeIds
   * @return {*}  {Promise<{ method_technique_attribute_quantitative_id: number }[]>}
   * @memberof TechniqueAttributeRepository
   */
  async deleteQuantitativeAttributesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    methodTechniqueAttributeQuantitativeIds: number[]
  ): Promise<{ method_technique_attribute_quantitative_id: number }[]> {
    defaultLog.debug({ label: 'deleteQuantitativeAttributesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .del()
      .from('method_technique_attribute_quantitative as mtaq')
      .leftJoin('method_technique as mt', 'mt.method_technique_id', 'mtaq.method_technique_id')
      .whereIn('method_technique_attribute_quantitative_id', methodTechniqueAttributeQuantitativeIds)
      .andWhere('mtaq.method_technique_id', methodTechniqueId)
      .andWhere('mt.survey_id', surveyId)
      .returning('method_technique_attribute_quantitative.method_technique_attribute_quantitative_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({
        method_technique_attribute_quantitative_id: z.number()
      })
    );

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete quantitative attribute', [
        'TechniqueAttributeRepository->deleteQuantitativeAttributesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Delete all qualitative and quantitative attribute records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<{
   *     qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
   *     quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
   *   }>}
   * @memberof TechniqueAttributeRepository
   */
  async deleteAllTechniqueAttributes(
    surveyId: number,
    methodTechniqueId: number
  ): Promise<{
    qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
    quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  }> {
    defaultLog.debug({ label: 'deleteAllTechniqueAttributes', surveyId, methodTechniqueId });

    // Query to delete all qualitative attributes for a technique
    const sqlStatement1 = SQL`
      DELETE FROM 
        method_technique_attribute_qualitative using method_technique 
      WHERE 
        method_technique.method_technique_id = method_technique_attribute_qualitative.method_technique_id 
      AND
        method_technique_attribute_qualitative.method_technique_id = ${methodTechniqueId}
      AND
        method_technique.survey_id = ${surveyId}
      RETURNING 
        method_technique_attribute_qualitative.method_technique_attribute_qualitative_id;
    `;

    // Query to delete all qualitative attributes for a technique
    const sqlStatement2 = SQL`
      DELETE FROM 
        method_technique_attribute_quantitative using method_technique 
      WHERE 
        method_technique.method_technique_id = method_technique_attribute_quantitative.method_technique_id 
      AND 
        method_technique_attribute_quantitative.method_technique_id = ${methodTechniqueId}
      AND
        method_technique.survey_id = ${surveyId}
      RETURNING 
        method_technique_attribute_quantitative.method_technique_attribute_quantitative_id;
    `;

    const response = await Promise.all([
      this.connection.sql(
        sqlStatement1,
        z.object({
          method_technique_attribute_qualitative_id: z.number()
        })
      ),
      this.connection.sql(
        sqlStatement2,
        z.object({
          method_technique_attribute_quantitative_id: z.number()
        })
      )
    ]);

    return {
      qualitative_attributes: response[0].rows,
      quantitative_attributes: response[1].rows
    };
  }
}
