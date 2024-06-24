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

export interface IQuantitativeAttributeRecord {
  method_technique_attribute_quantitative_id: number;
  method_lookup_attribute_quantitative_id: string;
  value: number;
}

export interface IQualitativeAttributeRecord {
  method_technique_attribute_qualitative_id: number;
  method_lookup_attribute_qualitative_id: string;
  method_lookup_attribute_qualitative_option_id: string;
}

export interface ITechniqueAttributeQuantitative {
  method_lookup_attribute_quantitative_id: string;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: string | null;
}

export interface ITechniqueAttributesObject {
  quantitative_attributes: IQuantitativeAttributeRecord[];
  qualitative_attributes: IQualitativeAttributeRecord[];
}

export interface ITechniqueAttributeQualitativeOption {
  method_lookup_attribute_qualitative_option_id: string;
  name: string;
  description: string | null;
}

export interface ITechniqueAttributeQualitative {
  method_lookup_attribute_qualitative_id: string;
  name: string;
  description: string | null;
  options: ITechniqueAttributeQualitativeOption[];
}

export interface IGetTechniqueAttributes {
  method_lookup_id: number;
  quantitative_attributes: ITechniqueAttributeQuantitative[];
  qualitative_attributes: ITechniqueAttributeQualitative[];
}

export const TechniqueAttributesLookupObject = z.object({
  method_lookup_id: z.number(),
  quantitative_attributes: z.array(
    z.object({
      method_lookup_attribute_quantitative_id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      unit: z.string().nullable(),
      min: z.number().nullable(),
      max: z.number().nullable()
    })
  ),
  qualitative_attributes: z.array(
    z.object({
      method_lookup_attribute_qualitative_id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      options: z.array(
        z.object({
          method_lookup_attribute_qualitative_option_id: z.string(),
          name: z.string(),
          description: z.string().nullable()
        })
      )
    })
  )
});

export type TechniqueAttributesLookupObject = z.infer<typeof TechniqueAttributesLookupObject>;

export const TechniqueAttributesObject = z.object({
  quantitative_attributes: z.array(
    z.object({
      method_technique_attribute_quantitative_id: z.number(),
      method_lookup_attribute_quantitative_id: z.string().uuid(),
      value: z.number()
    })
  ),
  qualitative_attributes: z.array(
    z.object({
      method_technique_attribute_qualitative_id: z.number(),
      method_lookup_attribute_qualitative_id: z.string().uuid(),
      method_lookup_attribute_qualitative_option_id: z.string()
    })
  )
});

export type TechniqueAttributesObject = z.infer<typeof TechniqueAttributesObject>;

export class TechniqueAttributeRepository extends BaseRepository {
  /**
   * Get quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<IGetTechniqueAttributes[]>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributesForMethodLookupIds(methodLookupIds: number[]): Promise<IGetTechniqueAttributes[]> {
    defaultLog.debug({ label: 'getAttributesForMethodLookupId', methodLookupIds });

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
          )) as options`)
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
   * Get quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number} techniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributeDefinitionsByTechniqueId(techniqueId: number): Promise<IGetTechniqueAttributes> {
    defaultLog.debug({ label: 'getAttributesForMethodLookupId', techniqueId });

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
          )) as options`)
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
        'mt.method_technique_id',
        knex.raw(`COALESCE(qual.qualitative_attributes, '[]'::json) as qualitative_attributes`),
        knex.raw(`COALESCE(quant.quantitative_attributes, '[]'::json) as quantitative_attributes`)
      )
      .from('method_technique as mt')
      .leftJoin('method_lookup as ml', 'ml.method_lookup_id', 'mt_method_lookup_id')
      .leftJoin('w_qualitative_attributes as qual', 'ml.method_lookup_id', 'qual.method_lookup_id')
      .leftJoin('w_quantitative_attributes as quant', 'ml.method_lookup_id', 'quant.method_lookup_id')
      .where('mt.method_technique_id', techniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesLookupObject);

    return response.rows[0];
  }

  /**
   * Get quantitative and qualitative attributes for a technique Id
   *
   * @param {number} techniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async getAttributesByTechniqueId(techniqueId: number): Promise<ITechniqueAttributesObject> {
    defaultLog.debug({ label: 'getAttributesByTechniqueId', techniqueId });

    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'method_technique_id',
            knex.raw(`json_agg(json_build_object(
          'method_technique_attribute_quantitative_id', method_technique_attribute_quantitative_id,
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
      .where('mt.method_technique_id', techniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesObject);

    return response.rows[0];
  }

  /**
   * Insert qualitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {IQualitativeAttributePostData[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async insertQualitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQualitativeAttributePostData[]
  ): Promise<void> {
    defaultLog.debug({ label: 'insertQualitativeAttributesForTechnique', techniqueId });

    if (attributes.length > 0) {
      const queryBuilder = getKnex()
        .insert(
          attributes.map((attribute) => ({
            method_lookup_attribute_qualitative_id: attribute.method_lookup_attribute_qualitative_id,
            method_lookup_attribute_qualitative_option_id: attribute.method_lookup_attribute_qualitative_option_id,
            method_technique_id: techniqueId
          }))
        )
        .into('method_technique_attribute_qualitative')
        .returning('method_technique_attribute_qualitative_id');

      await this.connection.knex(queryBuilder, z.object({ method_technique_attribute_qualitative_id: z.number() }));
    }
  }

  /**
   * Insert quantitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {IQuantitativeAttributePostData[]} attributes
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async insertQuantitativeAttributesForTechnique(
    techniqueId: number,
    attributes: IQuantitativeAttributePostData[]
  ): Promise<void> {
    defaultLog.debug({ label: 'insertQuantitativeAttributesForTechnique', techniqueId });

    console.log(techniqueId);

    if (attributes.length > 0) {
      const queryBuilder = getKnex()
        .insert(
          attributes.map((attribute) => ({
            method_lookup_attribute_quantitative_id: attribute.method_lookup_attribute_quantitative_id,
            value: attribute.value,
            method_technique_id: techniqueId
          }))
        )
        .into('method_technique_attribute_quantitative')
        .returning('method_technique_attribute_quantitative_id');

      await this.connection.knex(queryBuilder, z.object({ method_technique_attribute_quantitative_id: z.number() }));
    }
  }

  /**
   * Update quantitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {IQuantitativeAttributePostData} attribute
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async updateQuantitativeAttributeForTechnique(
    techniqueId: number,
    attribute: IQuantitativeAttributePostData
  ): Promise<void> {
    defaultLog.debug({ label: 'updateQuantitativeAttributesForTechnique', techniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_attribute_quantitative')
      .update({
        method_lookup_attribute_quantitative_id: attribute.method_lookup_attribute_quantitative_id,
        value: attribute.value
      })
      .where('method_technique_attribute_quantitative_id', attribute.method_technique_attribute_quantitative_id);

    await this.connection.knex(queryBuilder, z.object({ method_technique_attribute_quantitative_id: z.number() }));
  }

  /**
   * Update qualitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {IQualitativeAttributePostData} attribute
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueAttributeRepository
   */
  async updateQualitativeAttributeForTechnique(
    techniqueId: number,
    attribute: IQualitativeAttributePostData
  ): Promise<void> {
    defaultLog.debug({ label: 'updateQualitativeAttributesForTechnique', techniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_attribute_qualitative')
      .update({
        method_lookup_attribute_qualitative_id: attribute.method_lookup_attribute_qualitative_id,
        method_lookup_attribute_qualitative_option_id: attribute.method_lookup_attribute_qualitative_option_id
      })
      .where('method_technique_attribute_qualitative_id', attribute.method_technique_attribute_qualitative_id);

    await this.connection.knex(queryBuilder, z.object({ method_technique_attribute_qualitative_id: z.number() }));
  }

  /**
   * Delete qualitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {number[]}  methodTechniqueAttributeQualitativeIds
   * @returns {*}
   * @memberof TechniqueAttributeRepository
   */
  async deleteQualitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    methodTechniqueAttributeQualitativeIds: number[]
  ): Promise<void> {
    defaultLog.debug({ label: 'deleteQualitativeAttributesForTechnique', techniqueId });

    const queryBuilder = getKnex()
      .del()
      .from('method_technique_attribute_qualitative as mtaq')
      .leftJoin('method_technique as mt', 'mt.method_technique_id', 'mtaq.method_technique_id')
      .whereIn('method_technique_attribute_qualitative_id', methodTechniqueAttributeQualitativeIds)
      .andWhere('mtaq.method_technique_id', techniqueId)
      .andWhere('mt.survey_id', surveyId)
      .returning('*');

    const response = await this.connection.knex(queryBuilder);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete qualitative attribute', [
        'TechniqueAttributeRepository->deleteQuantitativeAttributesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Delete quantitative attributes for a technique
   *
   * @param {number} techniqueId
   * @param {number[]} methodTechniqueAttributeQuantitativeIds
   * @returns {*}
   * @memberof TechniqueAttributeRepository
   */
  async deleteQuantitativeAttributesForTechnique(
    surveyId: number,
    techniqueId: number,
    methodTechniqueAttributeQuantitativeIds: number[]
  ): Promise<void> {
    defaultLog.debug({ label: 'deleteQuantitativeAttributesForTechnique', techniqueId });

    const queryBuilder = getKnex()
      .del()
      .from('method_technique_attribute_quantitative as mtaq')
      .leftJoin('method_technique as mt', 'mt.method_technique_id', 'mtaq.method_technique_id')
      .whereIn('method_technique_attribute_quantitative_id', methodTechniqueAttributeQuantitativeIds)
      .andWhere('mtaq.method_technique_id', techniqueId)
      .andWhere('mt.survey_id', surveyId)
      .returning('*');

    const response = await this.connection.knex(queryBuilder);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete quantitative attribute', [
        'TechniqueAttributeRepository->deleteQuantitativeAttributesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
