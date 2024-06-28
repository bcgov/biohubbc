import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const AttractantRecord = z.object({
  method_technique_attractant_id: z.number(),
  method_technique_id: z.number(),
  attractant_lookup_id: z.number()
});

export type AttractantRecord = z.infer<typeof AttractantRecord>;

export interface IAttractantPostData {
  attractant_lookup_id: number;
}

/**
 * Attractant repository.
 *
 * Handles all database operations related to technique attractants.
 *
 * @export
 * @class AttractantRepository
 * @extends {BaseRepository}
 */
export class AttractantRepository extends BaseRepository {
  /**
   * Get attractants for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<AttractantRecord[]>}
   * @memberof AttractantRepository
   */
  async getAttractantsByTechniqueId(surveyId: number, methodTechniqueId: number): Promise<AttractantRecord[]> {
    const sqlStatement = SQL`
      SELECT 
        method_technique_attractant.method_technique_attractant_id, 
        method_technique_attractant.method_technique_id,
        method_technique_attractant.attractant_lookup_id
      FROM 
        method_technique_attractant 
      INNER JOIN 
        method_technique
          ON method_technique.method_technique_id = method_technique_attractant.method_technique_id
      WHERE 
        method_technique_attractant.method_technique_id = ${methodTechniqueId}
      AND 
        method_technique.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, AttractantRecord);

    return response.rows;
  }

  /**
   * Create attractant records for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {IAttractantPostData[]} attractants
   * @return {*}  {Promise<{ method_technique_attractant_id: number }[]>}
   * @memberof AttractantRepository
   */
  async insertAttractantsForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    attractants: IAttractantPostData[]
  ): Promise<{ method_technique_attractant_id: number }[]> {
    if (!attractants.length) {
      return [];
    }

    const queryBuilder = getKnex()
      .insert(
        attractants.map((attractant) => ({
          attractant_lookup_id: attractant.attractant_lookup_id,
          method_technique_id: methodTechniqueId
        }))
      )
      .into('method_technique_attractant')
      .innerJoin(
        'method_technique',
        'method_technique.method_technique_id',
        'method_technique_attractant.method_technique_id'
      )
      .where('method_technique.survey_id', surveyId)
      .returning('method_technique_attractant_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_attractant_id: z.number() }));

    return response.rows;
  }

  /**
   * Delete technique attractants.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {number[]} attractantLookupIds
   * @return {*}  {Promise<void>}
   * @memberof AttractantRepository
   */
  async deleteTechniqueAttractants(
    surveyId: number,
    methodTechniqueId: number,
    attractantLookupIds: number[]
  ): Promise<void> {
    if (attractantLookupIds.length > 0) {
      const queryBuilder = getKnex()
        .delete()
        .table('method_technique_attractant')
        .join(
          'method_technique',
          'method_technique.method_technique_id',
          'method_technique_attractant.method_technique_id'
        )
        .whereIn('method_technique_attractant.attractant_lookup_id', attractantLookupIds)
        .andWhere('method_technique_attractant.method_technique_id', methodTechniqueId)
        .andWhere('method_technique.survey_id', surveyId);

      const response = await this.connection.knex(queryBuilder);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to delete technique', [
          'AttractantRepository->deleteTechnique',
          'rows was null or undefined, expected rows != null'
        ]);
      }
    }
  }

  /**
   * Delete all technique attractants.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof AttractantRepository
   */
  async deleteAllTechniqueAttractants(surveyId: number, methodTechniqueId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE
      FROM method_technique_attractant mta
        USING method_technique mt
      WHERE mt.method_technique_id = mta.method_technique_id AND
        mt.survey_id = ${surveyId} AND
        mta.method_technique_id = ${methodTechniqueId}
      RETURNING
        method_technique_attractant_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete technique', [
        'AttractantRepository->deleteTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
