import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/attractants-repository');

export const AttractantRecord = z.object({
  method_technique_attractant_id: z.number(),
  method_technique_id: z.number(),
  attractant_lookup_id: z.number()
});

export type AttractantRecord = z.infer<typeof AttractantRecord>;

export interface IAttractantPostData {
  attractant_lookup_id: number;
}

export class AttractantRepository extends BaseRepository {
  /**
   * Get attractants for a technique
   *
   * @param {number} techniqueId
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async getAttractantsByTechniqueId(techniqueId: number): Promise<AttractantRecord[]> {
    defaultLog.debug({ label: 'getAttractantsByTechniqueId', techniqueId });

    const sqlStatement = SQL`
      SELECT 
        method_technique_attractant_id, 
        method_technique_id,
        attractant_lookup_id
      FROM method_technique_attractant 
      WHERE method_technique_id = ${techniqueId};
    `;

    const response = await this.connection.sql(sqlStatement, AttractantRecord);

    return response.rows;
  }

  /**
   * Insert attractants for a technique
   *
   * @param {number} techniqueId
   * @param {IAttractantPostData[]} attractants
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async insertAttractantsForTechnique(techniqueId: number, attractants: IAttractantPostData[]): Promise<void> {
    defaultLog.debug({ label: 'insertTechnique', techniqueId });

    if (attractants.length > 0) {
      const queryBuilder = getKnex()
        .insert(
          attractants.map((attractant) => ({
            attractant_lookup_id: attractant.attractant_lookup_id,
            method_technique_id: techniqueId
          }))
        )
        .into('method_technique_attractant')
        .returning('method_technique_attractant_id');

      await this.connection.knex(queryBuilder, z.object({ method_technique_attractant_id: z.number() }));
    }
  }

  /**
   * Delete technique attractants
   *
   * @param {number} techniqueId
   * @param {number[]} attractantLookupIds
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async deleteTechniqueAttractants(techniqueId: number, attractantLookupIds: number[]): Promise<void> {
    defaultLog.debug({ label: 'deleteTechniqueAttractants', techniqueId });

    if (attractantLookupIds.length > 0) {
      const queryBuilder = getKnex()
        .table('method_technique_attractant')
        .whereIn('attractant_lookup_id', attractantLookupIds)
        .andWhere('method_technique_id', techniqueId)
        .del();

      const response = await this.connection.knex(queryBuilder);

      if (!response.rowCount) {
        throw new ApiExecuteSQLError('Failed to delete technique', [
          'TechniqueRepository->deleteTechnique',
          'rows was null or undefined, expected rows != null'
        ]);
      }
    }
  }

  /**
   * Delete technique attractants
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @returns {*}
   * @memberof TechniqueRepository
   */
  async deleteAllTechniqueAttractants(surveyId: number, methodTechniqueId: number): Promise<void> {
    defaultLog.debug({ label: 'deleteTechnique', methodTechniqueId });

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
        'TechniqueRepository->deleteTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
