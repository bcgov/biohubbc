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
  quantitative_attributes: { method_technique_attribute_quantitative_id: string }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: string }[];
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniquePostData {
  survey_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_technique_id: number;
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

export const TechniqueObject = z.object({
  method_technique_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  distance_threshold: z.number().nullable(),
  method_lookup_id: z.number(),
  attractants: z.array(z.object({ attractant_lookup_id: z.number() })),
  quantitative_attributes: z.array(z.object({ method_technique_attribute_quantitative_id: z.string().uuid() })),
  qualitative_attributes: z.array(z.object({ method_technique_attribute_qualitative_id: z.string().uuid() }))
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
            'method_technique_id',
            knex.raw(`
          json_agg(json_build_object(
            'method_technique_attribute_quantitative_id', method_technique_attribute_quantitative_id
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
            'method_technique_attribute_qualitative_id', method_technique_attribute_qualitative_id
          )) as qualitative_attributes
        `)
          )
          .from('method_technique_attribute_qualitative')
          .groupBy('method_technique_id')
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
      .leftJoin('w_qualitative_attributes', 'w_qualitative_attributes.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_quantitative_attributes', 'w_quantitative_attributes.method_technique_id', 'mt.method_technique_id')
      .where('mt.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    console.log(response);

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
}
