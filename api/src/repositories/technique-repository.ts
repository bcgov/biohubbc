import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { IAttractantPostData } from './attractants-repository';
import { BaseRepository } from './base-repository';
import {
  IQualitativeAttributePostData,
  IQualitativeAttributeRecord,
  IQuantitativeAttributePostData,
  IQuantitativeAttributeRecord
} from './technique-attribute-repository';

const defaultLog = getLogger('repositories/survey-repository');

export interface IGetTechnique {
  method_technique_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  attributes: {
    quantitative_attributes: IQuantitativeAttributeRecord[];
    qualitative_attributes: IQualitativeAttributeRecord[];
  };
  attractants: { attractant_lookup_id: number }[];
}

export interface ITechniquePostData {
  survey_id: number;
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  attributes: {
    quantitative_attributes: IQuantitativeAttributePostData[];
    qualitative_attributes: IQualitativeAttributePostData[];
  };
  attractants: IAttractantPostData[];
}

export interface ITechniqueRowDataForInsert {
  name: string;
  description: string | null;
  distance_threshold: number | null;
  method_lookup_id: number;
  survey_id: number;
}

export interface ITechniqueRowDataForUpdate extends ITechniqueRowDataForInsert {
  method_technique_id: number;
}

export const TechniqueObject = z.object({
  method_technique_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  distance_threshold: z.number().nullable(),
  method_lookup_id: z.number(),
  attractants: z.array(z.object({ attractant_lookup_id: z.number() })),
  attributes: z.object({
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
        method_lookup_attribute_qualitative_option_id: z.string().uuid()
      })
    )
  })
});

export type TechniqueObject = z.infer<typeof TechniqueObject>;

export class TechniqueRepository extends BaseRepository {
  /**
   * Private utility function to generate the common SQL query for fetching techniques
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
            knex.raw(`json_agg(json_build_object(
          'attractant_lookup_id', attractant_lookup_id
        )) as attractants`)
          )
          .from('method_technique_attractant')
          .groupBy('method_technique_id')
      )
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
      .with(
        'w_attributes',
        knex
          .select(
            'w_quantitative_attributes.method_technique_id',
            knex.raw(`json_build_object(
          'quantitative_attributes', COALESCE(w_quantitative_attributes.quantitative_attributes, '[]'::json),
          'qualitative_attributes', COALESCE(w_qualitative_attributes.qualitative_attributes, '[]'::json)
        ) as attributes`)
          )
          .from('w_quantitative_attributes')
          .leftJoin(
            'w_qualitative_attributes',
            'w_qualitative_attributes.method_technique_id',
            'w_quantitative_attributes.method_technique_id'
          )
      )
      .select(
        'mt.method_technique_id',
        'mt.name',
        'mt.description',
        'mt.distance_threshold',
        'mt.method_lookup_id',
        knex.raw(`COALESCE(w_attractants.attractants, '[]'::json) as attractants`),
        knex.raw(
          `COALESCE(w_attributes.attributes, '{"quantitative_attributes": [], "qualitative_attributes": []}'::json) as attributes`
        )
      )
      .from('method_technique as mt')
      .leftJoin('w_attractants', 'w_attractants.method_technique_id', 'mt.method_technique_id')
      .leftJoin('w_attributes', 'w_attributes.method_technique_id', 'mt.method_technique_id')
      .where('mt.survey_id', surveyId);

    return queryBuilder;
  }

  /**
   * Get techniques for a given survey Id
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async getTechniqueById(surveyId: number, techniqueId: number): Promise<IGetTechnique> {
    defaultLog.debug({ label: 'getTechniqueById', techniqueId });

    const queryBuilder = this._generateGetTechniqueQuery(surveyId).andWhere('mt.method_technique_id', techniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    return response.rows[0];
  }

  /**
   * Get techniques for a given survey Id
   *
   * @param {number} surveyId
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async getTechniquesForSurveyId(surveyId: number): Promise<IGetTechnique[]> {
    defaultLog.debug({ label: 'getTechniquesForSurveyId', surveyId });

    const queryBuilder = this._generateGetTechniqueQuery(surveyId);

    const response = await this.connection.knex(queryBuilder, TechniqueObject);

    console.log(response.rows);

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
    techniqueObject: ITechniqueRowDataForInsert,
    surveyId: number
  ): Promise<{ method_technique_id: number }> {
    defaultLog.debug({ label: 'insertTechnique', surveyId });

    const queryBuilder = getKnex().insert(techniqueObject).into('method_technique').returning('method_technique_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_id: z.number() }));

    return response.rows[0];
  }

  /**
   * Update technique in a survey
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {number} techniqueObject
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueRepository
   */
  async updateTechnique(
    techniqueObject: ITechniqueRowDataForInsert,
    techniqueId: number,
    surveyId: number
  ): Promise<void> {
    defaultLog.debug({ label: 'insertTechnique', surveyId });

    const queryBuilder = getKnex()
      .table('method_technique')
      .update(techniqueObject)
      .where('method_technique_id', techniqueId)
      .andWhere('survey_id', surveyId);

    await this.connection.knex(queryBuilder, z.object({ method_technique_id: z.number() }));
  }

  /**
   * Delete a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async deleteTechnique(surveyId: number, methodTechniqueId: number): Promise<number> {
    defaultLog.debug({ label: 'deleteTechnique', methodTechniqueId });

    const sqlStatement = SQL`
      DELETE
      FROM method_technique mt
      WHERE mt.survey_id = ${surveyId} AND
        mt.method_technique_id = ${methodTechniqueId}
      RETURNING
        mt.method_technique_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete technique', [
        'TechniqueRepository->deleteTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
