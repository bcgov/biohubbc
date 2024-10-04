import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

// Environment unit type definition.
export const EnvironmentUnit = z.enum([
  // Should be kept in sync with the database table `environment_unit`
  'millimeter',
  'centimeter',
  'meter',
  'milligram',
  'gram',
  'kilogram',
  'percent',
  'celsius',
  'ppt',
  'SCF',
  'degrees',
  'pH'
]);
export type EnvironmentUnit = z.infer<typeof EnvironmentUnit>;

// Qualitative environment option type definition.
const QualitativeEnvironmentOption = z.object({
  environment_qualitative_option_id: z.string().uuid(),
  environment_qualitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable()
});
export type QualitativeEnvironmentOption = z.infer<typeof QualitativeEnvironmentOption>;

// Qualitative environment type definition.
export const QualitativeEnvironmentTypeDefinition = z.object({
  environment_qualitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  options: z.array(QualitativeEnvironmentOption)
});
export type QualitativeEnvironmentTypeDefinition = z.infer<typeof QualitativeEnvironmentTypeDefinition>;

// Quantitative environment type definition.
const QuantitativeEnvironmentTypeDefinition = z.object({
  environment_quantitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  unit: EnvironmentUnit.nullable()
});
export type QuantitativeEnvironmentTypeDefinition = z.infer<typeof QuantitativeEnvironmentTypeDefinition>;

/**
 * Mixed environment columns type definition.
 */
export type EnvironmentType = {
  qualitative_environments: QualitativeEnvironmentTypeDefinition[];
  quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
};

export const ObservationSubCountQualitativeEnvironmentRecord = z.object({
  observation_subcount_qualitative_environment_id: z.number(),
  observation_subcount_id: z.number(),
  environment_qualitative_id: z.string().uuid(),
  environment_qualitative_option_id: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountQualitativeEnvironmentRecord = z.infer<
  typeof ObservationSubCountQualitativeEnvironmentRecord
>;

export const ObservationSubCountQuantitativeEnvironmentRecord = z.object({
  observation_subcount_quantitative_environment_id: z.number(),
  observation_subcount_id: z.number(),
  environment_quantitative_id: z.string().uuid(),
  value: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountQuantitativeEnvironmentRecord = z.infer<
  typeof ObservationSubCountQuantitativeEnvironmentRecord
>;

export interface InsertObservationSubCountQualitativeEnvironmentRecord {
  observation_subcount_id: number;
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
}

export interface InsertObservationSubCountQuantitativeEnvironmentRecord {
  observation_subcount_id: number;
  environment_quantitative_id: string;
  value: number;
}

export class ObservationSubCountEnvironmentRepository extends BaseRepository {
  /**
   * Insert qualitative environment records.
   *
   * @param {InsertObservationSubCountQualitativeEnvironmentRecord[]} record
   * @return {*}  {Promise<ObservationSubCountQualitativeEnvironmentRecord[]>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async insertObservationQualitativeEnvironmentRecords(
    record: InsertObservationSubCountQualitativeEnvironmentRecord[]
  ): Promise<ObservationSubCountQualitativeEnvironmentRecord[]> {
    const qb = getKnex()
      .queryBuilder()
      .insert(record)
      .into('observation_subcount_qualitative_environment')
      .returning('*');

    const response = await this.connection.knex(qb, ObservationSubCountQualitativeEnvironmentRecord);

    return response.rows;
  }

  /**
   * Insert quantitative environment records.
   *
   * @param {InsertObservationSubCountQuantitativeEnvironmentRecord[]} record
   * @return {*}  {Promise<ObservationSubCountQuantitativeEnvironmentRecord[]>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async insertObservationQuantitativeEnvironmentRecords(
    record: InsertObservationSubCountQuantitativeEnvironmentRecord[]
  ): Promise<ObservationSubCountQuantitativeEnvironmentRecord[]> {
    const qb = getKnex()
      .queryBuilder()
      .insert(record)
      .into('observation_subcount_quantitative_environment')
      .returning('*');

    const response = await this.connection.knex(qb, ObservationSubCountQuantitativeEnvironmentRecord);

    return response.rows;
  }

  /**
   * Delete all environment records for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationSubCountEnvironmentRepository
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
   * @memberof ObservationSubCountEnvironmentRepository
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
   * @memberof ObservationSubCountEnvironmentRepository
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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async getQualitativeEnvironmentTypeDefinitionsForSurvey(
    surveyId: number
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      WITH w_observation_subcount_qualitative_environment AS (
        SELECT DISTINCT
          environment_qualitative_id
        FROM
          survey_observation
          LEFT JOIN observation_subcount ON survey_observation.survey_observation_id = observation_subcount.survey_observation_id
          LEFT JOIN observation_subcount_qualitative_environment ON observation_subcount.observation_subcount_id = observation_subcount_qualitative_environment.observation_subcount_id
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
        w_observation_subcount_qualitative_environment
        INNER JOIN environment_qualitative ON environment_qualitative.environment_qualitative_id = w_observation_subcount_qualitative_environment.environment_qualitative_id
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
   * @memberof ObservationSubCountEnvironmentRepository
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
        INNER JOIN observation_subcount ON
          survey_observation.survey_observation_id = observation_subcount.survey_observation_id
        INNER JOIN observation_subcount_quantitative_environment
          ON observation_subcount.observation_subcount_id = observation_subcount_quantitative_environment.observation_subcount_id
        INNER JOIN environment_quantitative
          ON observation_subcount_quantitative_environment.environment_quantitative_id = environment_quantitative.environment_quantitative_id
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
   * @memberof ObservationSubCountEnvironmentRepository
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

    for (const searchTerm of searchTerms) {
      queryBuilder
        .where('environment_qualitative.name', 'ILIKE', `%${searchTerm}%`)
        .orWhere('environment_qualitative.description', 'ILIKE', `%${searchTerm}%`);
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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    const queryBuilder = getKnex()
      .select(
        'environment_quantitative.environment_quantitative_id',
        'environment_quantitative.name',
        'environment_quantitative.description',
        'environment_quantitative.min',
        'environment_quantitative.max',
        'environment_quantitative.unit'
      )
      .from('environment_quantitative');

    for (const searchTerm of searchTerms) {
      queryBuilder
        .where('environment_quantitative.name', 'ILIKE', `%${searchTerm}%`)
        .orWhere('environment_quantitative.description', 'ILIKE', `%${searchTerm}%`);
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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteObservationQualitativeEnvironmentRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_qualitative_environment')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_qualitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere(`survey_observation.survey_id`, surveyId)
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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteObservationQuantitativeEnvironmentRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_quantitative_environment')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_quantitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere(`survey_observation.survey_id`, surveyId)
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
   * @memberof ObservationSubCountEnvironmentRepository
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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteQualitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_qualitative_ids: string[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_qualitative_environment')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_qualitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn('observation_subcount_qualitative_environment.environment_qualitative_id', environment_qualitative_ids);

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
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteQuantitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_quantitative_ids: string[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_quantitative_environment')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_quantitative_environment.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere('survey_observation.survey_id', surveyId)
      .whereIn(
        'observation_subcount_quantitative_environment.environment_quantitative_id',
        environment_quantitative_ids
      );

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }
}
