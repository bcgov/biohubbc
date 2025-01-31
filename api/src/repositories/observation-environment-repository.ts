import SQL from 'sql-template-strings';
import { z } from 'zod';
import { EnvironmentQualitativeRecord } from '../database-models/environment_qualitative';
import { EnvironmentQualitativeOptionRecord } from '../database-models/environment_qualitative_option';
import { EnvironmentQuantitativeRecord } from '../database-models/environment_quantitative';
import { ObservationEnvironmentQualitativeModel } from '../database-models/observation_environment_qualitative';
import { ObservationEnvironmentQuantitativeModel } from '../database-models/observation_environment_quantitative';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

// Qualitative environment type definition.
export const QualitativeEnvironmentTypeDefinition = EnvironmentQualitativeRecord.omit({
  record_end_date: true
}).extend({
  options: z.array(
    EnvironmentQualitativeOptionRecord.omit({
      record_end_date: true
    })
  )
});
export type QualitativeEnvironmentTypeDefinition = z.infer<typeof QualitativeEnvironmentTypeDefinition>;

// Quantitative environment type definition.
const QuantitativeEnvironmentTypeDefinition = EnvironmentQuantitativeRecord.omit({
  record_end_date: true
});
export type QuantitativeEnvironmentTypeDefinition = z.infer<typeof QuantitativeEnvironmentTypeDefinition>;

export interface InsertObservationQualitativeEnvironmentRecord {
  survey_observation_id: number;
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
}

export interface InsertObservationQuantitativeEnvironmentRecord {
  survey_observation_id: number;
  environment_quantitative_id: string;
  value: number;
}

export class ObservationEnvironmentRepository extends BaseRepository {
  /**
   * Insert qualitative environment records.
   *
   * @param {InsertObservationQualitativeEnvironmentRecord[]} record
   * @return {*}  {Promise<ObservationEnvironmentQualitativeModel[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async insertObservationQualitativeEnvironmentRecords(
    record: InsertObservationQualitativeEnvironmentRecord[]
  ): Promise<ObservationEnvironmentQualitativeModel[]> {
    const qb = getKnex().queryBuilder().insert(record).into('observation_environment_qualitative').returning('*');

    const response = await this.connection.knex(qb, ObservationEnvironmentQualitativeModel);

    return response.rows;
  }

  /**
   * Insert quantitative environment records.
   *
   * @param {InsertObservationQuantitativeEnvironmentRecord[]} record
   * @return {*}  {Promise<ObservationEnvironmentQuantitativeModel[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async insertObservationQuantitativeEnvironmentRecords(
    record: InsertObservationQuantitativeEnvironmentRecord[]
  ): Promise<ObservationEnvironmentQuantitativeModel[]> {
    const qb = getKnex().queryBuilder().insert(record).into('observation_environment_quantitative').returning('*');

    const response = await this.connection.knex(qb, ObservationEnvironmentQuantitativeModel);

    return response.rows;
  }

  /**
   * Delete all environment records for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationEnvironmentRepository
   */
  async deleteObservationEnvironments(surveyId: number, surveyObservationId: number[]) {
    await this.deleteObservationQualitativeEnvironmentRecordsForSurveyObservationIds(surveyObservationId, surveyId);
    await this.deleteObservationQuantitativeEnvironmentRecordsForSurveyObservationIds(surveyObservationId, surveyId);
  }

  /**
   * Get all distinct qualitative environment type definition records for the given qualitative environment record ids
   * (uuid).
   *
   * @param {string[]} environmentQualitativeIds
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async getQualitativeEnvironmentTypeDefinitions(
    environmentQualitativeIds: string[]
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description,
        json_agg(
          json_build_object(
            'environment_qualitative_option_id', environment_qualitative_option.environment_qualitative_option_id,
            'environment_qualitative_id', environment_qualitative_option.environment_qualitative_id,
            'name', environment_qualitative_option.name,
            'description', environment_qualitative_option.description
          )
        ) AS options
      FROM
        environment_qualitative
        INNER JOIN environment_qualitative_option ON environment_qualitative.environment_qualitative_id = environment_qualitative_option.environment_qualitative_id
      WHERE
        environment_qualitative.environment_qualitative_id = ANY(${environmentQualitativeIds})
      GROUP BY
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description;
    `;

    const response = await this.connection.sql(sqlStatement, QualitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Get all quantitative environment type definition records for the given quantitative environment record ids (uuid).
   *
   * @param {string[]} environmentQuantitativeIds
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async getQuantitativeEnvironmentTypeDefinitions(
    environmentQuantitativeIds: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT
        environment_quantitative_id,
        name,
        description,
        min,
        max,
        unit
      FROM
        environment_quantitative
      WHERE
        environment_quantitative_id = ANY(${environmentQuantitativeIds});
  `;

    const response = await this.connection.sql(sqlStatement, QuantitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Get all distinct qualitative environment type definition records for all unique qualitative environment records
   * associated to a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async getQualitativeEnvironmentTypeDefinitionsForSurvey(
    surveyId: number
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      WITH w_observation_environment_qualitative AS (
        SELECT DISTINCT
          environment_qualitative_id
        FROM
          survey_observation
          LEFT JOIN observation_environment_qualitative ON observation_environment_qualitative.survey_observation_id = survey_observation.survey_observation_id
        WHERE
          survey_observation.survey_id = ${surveyId}
      )
      SELECT
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description,
        json_agg(
          json_build_object(
            'environment_qualitative_option_id', environment_qualitative_option.environment_qualitative_option_id,
            'environment_qualitative_id', environment_qualitative_option.environment_qualitative_id,
            'name', environment_qualitative_option.name,
            'description', environment_qualitative_option.description
          )
        ) AS options
      FROM
        w_observation_environment_qualitative
        INNER JOIN environment_qualitative ON environment_qualitative.environment_qualitative_id = w_observation_environment_qualitative.environment_qualitative_id
        INNER JOIN environment_qualitative_option ON environment_qualitative.environment_qualitative_id = environment_qualitative_option.environment_qualitative_id
      GROUP BY
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description;
    `;

    const response = await this.connection.sql(sqlStatement, QualitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Get all distinct quantitative environment type definition records for all unique quantitative environments for a
   * given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async getQuantitativeEnvironmentTypeDefinitionsForSurvey(
    surveyId: number
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT DISTINCT
        environment_quantitative.environment_quantitative_id,
        environment_quantitative.name,
        environment_quantitative.description,
        environment_quantitative.min,
        environment_quantitative.max,
        environment_quantitative.unit
      FROM
        survey_observation
        INNER JOIN observation_environment_quantitative
          ON survey_observation.survey_observation_id = observation_environment_quantitative.survey_observation_id
        INNER JOIN environment_quantitative
          ON observation_environment_quantitative.environment_quantitative_id = environment_quantitative.environment_quantitative_id
      WHERE
        survey_observation.survey_id = ${surveyId};
  `;

    const response = await this.connection.sql(sqlStatement, QuantitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Find qualitative environment type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async findQualitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select(
        'environment_qualitative.environment_qualitative_id',
        'environment_qualitative.name',
        'environment_qualitative.description',
        knex.raw(`
          COALESCE(
            json_agg(
              CASE 
                WHEN environment_qualitative_option.environment_qualitative_option_id IS NOT NULL THEN 
                  json_build_object(
                    'environment_qualitative_option_id', environment_qualitative_option.environment_qualitative_option_id, 
                    'environment_qualitative_id', environment_qualitative.environment_qualitative_id, 
                    'name', environment_qualitative_option.name, 
                    'description', environment_qualitative_option.description
                  )
              END
            ) FILTER (
              WHERE environment_qualitative_option.environment_qualitative_option_id IS NOT NULL
            ), 
            '[]'::json
          ) AS options 
        `)
      )
      .from('environment_qualitative')
      .leftJoin(
        'environment_qualitative_option',
        'environment_qualitative_option.environment_qualitative_id',
        '=',
        'environment_qualitative.environment_qualitative_id'
      );

    const searchConditions = [];

    for (const searchTerm of searchTerms) {
      searchConditions.push(
        knex.raw('environment_qualitative.name ILIKE ? OR environment_qualitative.description ILIKE ?', [
          `%${searchTerm}%`,
          `%${searchTerm}%`
        ])
      );
    }

    if (searchConditions.length > 0) {
      queryBuilder.whereRaw(searchConditions.join(' OR '));
    }

    queryBuilder.groupBy(
      'environment_qualitative.environment_qualitative_id',
      'environment_qualitative.name',
      'environment_qualitative.description'
    );

    const response = await this.connection.knex(queryBuilder, QualitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Find quantitative environment type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentRepository
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'environment_quantitative.environment_quantitative_id',
        'environment_quantitative.name',
        'environment_quantitative.description',
        'environment_quantitative.min',
        'environment_quantitative.max',
        'environment_quantitative.unit'
      )
      .from('environment_quantitative');

    const searchConditions = [];

    for (const searchTerm of searchTerms) {
      searchConditions.push(
        knex.raw('environment_quantitative.name ILIKE ? OR environment_quantitative.description ILIKE ?', [
          `%${searchTerm}%`,
          `%${searchTerm}%`
        ])
      );
    }

    if (searchConditions.length > 0) {
      queryBuilder.whereRaw(searchConditions.join(' OR '));
    }

    const response = await this.connection.knex(queryBuilder, QuantitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Delete all qualitative environment records for a given survey and set of survey observation ids.
   *
   * @param {number[]} surveyObservationId
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationEnvironmentRepository
   */
  async deleteObservationQualitativeEnvironmentRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_environment_qualitative')
      .using(['survey_observation'])
      .andWhere('observation_environment_qualitative.survey_observation_id', 'survey_observation.survey_observation_id')
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn('survey_observation.survey_observation_id', surveyObservationId);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all quantitative environment records for a given survey and set of survey observation ids.
   *
   * @param {number[]} surveyObservationId
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationEnvironmentRepository
   */
  async deleteObservationQuantitativeEnvironmentRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_environment_quantitative')
      .using(['survey_observation'])
      .andWhere(
        'observation_environment_quantitative.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn('survey_observation.survey_observation_id', surveyObservationId);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all environment records, for all observation records, for a given survey and set of environment ids.
   *
   * @param {number} surveyId
   * @param {{
   *       environment_qualitative_id: string[];
   *       environment_quantitative_id: string[];
   *     }} environmentIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationEnvironmentRepository
   */
  async deleteEnvironmentsForEnvironmentIds(
    surveyId: number,
    environmentIds: {
      environment_qualitative_id: string[];
      environment_quantitative_id: string[];
    }
  ): Promise<void> {
    await Promise.all([
      this.deleteQualitativeEnvironmentForEnvironmentIds(surveyId, environmentIds.environment_qualitative_id),
      this.deleteQuantitativeEnvironmentForEnvironmentIds(surveyId, environmentIds.environment_quantitative_id)
    ]);
  }

  /**
   * Delete all qualitative environment records, for all observation records, for a given survey and set of environment
   * qualitative ids.
   *
   * @param {number} surveyId
   * @param {string[]} environment_qualitative_id
   * @return {*}  {Promise<number>}
   * @memberof ObservationEnvironmentRepository
   */
  async deleteQualitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_qualitative_ids: string[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_environment_qualitative')
      .using(['survey_observation'])
      .andWhere('observation_environment_qualitative.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn('observation_environment_qualitative.environment_qualitative_id', environment_qualitative_ids);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all quantitative environment records, for all observation records, for a given survey and set of environment
   * quantitative ids.
   *
   * @param {number} surveyId
   * @param {string[]} environment_quantitative_id
   * @return {*}  {Promise<number>}
   * @memberof ObservationEnvironmentRepository
   */
  async deleteQuantitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_quantitative_ids: string[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_environment_quantitative')
      .using(['survey_observation'])
      .andWhere('observation_environment_quantitative.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn('observation_environment_quantitative.environment_quantitative_id', environment_quantitative_ids);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }
}
