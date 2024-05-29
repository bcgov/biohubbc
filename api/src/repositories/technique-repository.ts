import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/survey-repository');

export interface ITechniqueResponse {
  method_technique_id: number;
  name: string;
  description: string;
  distance_threshold: number;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
}

export interface ITechniquePostData {
  survey_id: number;
  name: string;
  description: string;
  distance_threshold: number;
  method_lookup_id: number;
  quantitative_attributes: { method_technique_attribute_quantitative_id: number }[];
  qualitative_attributes: { method_technique_attribute_qualitative_id: number }[];
}

export interface ITechniqueRowData {
  name: string;
  description: string;
  distance_threshold: number;
  method_lookup_id: number;
  survey_id: number;
}

export const TechniqueObject = z.object({
  method_technique_id: z.number(),
  name: z.string(),
  description: z.string(),
  distance_threshold: z.number(),
  method_lookup_id: z.number(),
  quantitative_attributes: z.array(z.object({ method_technique_attribute_quantitative_id: z.number() })),
  qualitative_attributes: z.array(z.object({ method_technique_attribute_qualitative_id: z.number() }))
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
  async getTechniquesForSurveyId(surveyId: number): Promise<ITechniqueResponse[]> {
    defaultLog.debug({ label: 'getTechniquesForSurveyId', surveyId });
    const knex = getKnex();

    const queryBuilder = knex
      .select([
        'method_technique_id',
        'name',
        'description',
        'distance_threshold',
        'method_lookup_id',
        knex.raw(`
            json_agg(json_build_object(
                'method_technique_attribute_qualitative_id', ssp.method_technique_attribute_qualitative_id
            )) as qualitative_attributes
            `),
        knex.raw(`
        json_agg(json_build_object(
            'method_technique_attribute_quantitative_id', ssp.method_technique_attribute_quantitative_id
        )) as quantitative_attributes
        `)
      ])
      .from('method_technique as mt')
      .leftJoin('method_technique_attractant as mta', 'mta.method_technique_id', 'mt.method_technique_id')
      .leftJoin('method_technique_attribute_qualitative as qual', 'qual.method_technique_id', 'mt.method_technique_id')
      .leftJoin(
        'method_technique_attribute_quantitative as quant',
        'quant.method_technique_id',
        'mt.method_technique_id'
      )
      .where('survey_id', surveyId);

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
}
