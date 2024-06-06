import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/survey-repository');

export interface IGetTechnique {
  method_technique_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  quantitative_attributes: { method_lookup_attribute_quantitative_id: string }[];
  qualitative_attributes: { method_lookup_attribute_qualitative_id: string }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniquePostData {
  survey_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: string }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: string }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniqueRowData {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  survey_id: number;
}

export interface IAttractantRowData {
  attractant_lookup_id: number;
}

export interface ITechniqueAttributeQuantitative {
  method_lookup_attribute_quantitative_id: string;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: string | null;
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

export const TechniqueAttributesObject = z.object({
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

export const TechniqueObject = z.object({
  method_technique_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  distance_threshold: z.number().nullable(),
  method_lookup_id: z.number(),
  attractants: z.array(z.object({ attractant_lookup_id: z.number() })),
  quantitative_attributes: z.array(z.object({ method_lookup_attribute_quantitative_id: z.string().uuid() })),
  qualitative_attributes: z.array(z.object({ method_lookup_attribute_qualitative_id: z.string().uuid() }))
});

export type TechniqueObject = z.infer<typeof TechniqueObject>;

export class TechniqueRepository extends BaseRepository {
  /**
   * Get techniques for a given survey Id
   *
   * @param {number} surveyId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async getTechniquesForSurveyId(surveyId: number): Promise<IGetTechnique[]> {
    defaultLog.debug({ label: 'getTechniquesForSurveyId', surveyId });
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
          )) as attractants
        `)
          )
          .from('method_technique_attractant')
          .groupBy('method_technique_id')
      )
      .with(
        'w_quantitative_attributes',
        knex
          .select(
            'method_lookup_id',
            knex.raw(`
          json_agg(json_build_object(
            'method_lookup_attribute_quantitative_id', method_lookup_attribute_quantitative_id
          )) as quantitative_attributes
        `)
          )
          .from('method_lookup_attribute_quantitative')
          .groupBy('method_lookup_id')
      )
      .with(
        'w_qualitative_attributes',
        knex
          .select(
            'method_lookup_id',
            knex.raw(`
          json_agg(json_build_object(
            'method_lookup_attribute_qualitative_id', method_lookup_attribute_qualitative_id
          )) as qualitative_attributes
        `)
          )
          .from('method_lookup_attribute_qualitative')
          .groupBy('method_lookup_id')
      )
      .select(
        'mt.method_technique_id',
        'mt.name',
        'mt.description',
        'mt.distance_threshold',
        'mt.method_lookup_id',
        knex.raw(`COALESCE(w_attractants.attractants, '[]'::json) as attractants`),
        knex.raw(`COALESCE(w_quantitative_attributes.quantitative_attributes, '[]'::json) as quantitative_attributes`),
        knex.raw(`COALESCE(w_qualitative_attributes.qualitative_attributes, '[]'::json) as qualitative_attributes`)
      )
      .from('method_technique as mt')
      .leftJoin('w_attractants', 'w_attractants.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_qualitative_attributes', 'w_qualitative_attributes.method_lookup_id', 'mt.method_lookup_id')
      .leftJoin('w_quantitative_attributes', 'w_quantitative_attributes.method_lookup_id', 'mt.method_lookup_id')
      .where('mt.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    return response.rows;
  }

  /**
   * Get techniques count for a given survey Id
   *
   * @param {number} surveyId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async getTechniquesCountForSurveyId(surveyId: number): Promise<number> {
    defaultLog.debug({ label: 'getTechniquesForSurveyId', surveyId });
    const knex = getKnex();

    const queryBuilder = knex
      .select(knex.raw('count(*)::integer as count'))
      .from('method_technique as mt')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Insert a new technique
   *
   * @param {number} surveyId
   * @param {number} techniqueObject
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async insertTechnique(
    techniqueObject: ITechniqueRowData,
    surveyId: number
  ): Promise<{ method_technique_id: number }> {
    defaultLog.debug({ label: 'insertTechnique', surveyId });

    const queryBuilder = getKnex().insert(techniqueObject).into('method_technique').returning('method_technique_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_id: z.number() }));

    return response.rows[0];
  }

  /**
   * Insert attractants for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} attractantLookupIds
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async insertAttractantsForTechnique(
    methodTechniqueId: number,
    attractantLookupIds: number[],
    surveyId: number
  ): Promise<void> {
    defaultLog.debug({ label: 'insertTechnique', surveyId });

    if (attractantLookupIds.length > 0) {
      const queryBuilder = getKnex()
        .insert(
          attractantLookupIds.map((attractantLookupId) => ({
            method_technique_id: methodTechniqueId,
            attractant_lookup_id: attractantLookupId
          }))
        )
        .into('method_technique_attractant')
        .returning('method_technique_attractant_id');

      await this.connection.knex(queryBuilder, z.object({ method_technique_attractant_id: z.number() }));
    }
  }

  /**
   * Get quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number[]} methodLookupIds
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
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
          'min', taq.min,
          'max', taq.max,
          'unit', taq.unit
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

    const response = await this.connection.knex(queryBuilder, TechniqueAttributesObject);

    return response.rows;
  }
}
