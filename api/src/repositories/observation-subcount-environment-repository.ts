import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export const EnvironmentUnit = z.enum([
  'millimeter',
  'centimeter',
  'meter',
  'milligram',
  'gram',
  'kilogram',
  'percent'
]);
export type EnvironmentUnit = z.infer<typeof EnvironmentUnit>;

const QuantitativeEnvironmentTypeDefinition = z.object({
  environment_quantitative_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  unit: EnvironmentUnit.nullable()
});
export type QuantitativeEnvironmentTypeDefinition = z.infer<typeof QuantitativeEnvironmentTypeDefinition>;

const QualitativeEnvironmentOption = z.object({
  environment_qualitative_option_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  value: z.string()
});
export type QualitativeEnvironmentOption = z.infer<typeof QualitativeEnvironmentOption>;

export const QualitativeEnvironmentTypeDefinition = z.object({
  environment_qualitative_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  options: z.array(QualitativeEnvironmentOption)
});
export type QualitativeEnvironmentTypeDefinition = z.infer<typeof QualitativeEnvironmentTypeDefinition>;

export const ObservationSubCountQualitativeEnvironmentRecord = z.object({
  observation_subcount_qualitative_environment_id: z.string().uuid(),
  observation_subcount_id: z.number(),
  environment_qualitative_environment_qualitative_option_id: z.string().uuid(),
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
  observation_subcount_quantitative_environment_id: z.string().uuid(),
  observation_subcount_id: z.number(),
  environment_quantitative_id: z.number(),
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
  environment_qualitative_environment_qualitative_option_id: string;
}
export interface InsertObservationSubCountQuantitativeEnvironmentRecord {
  observation_subcount_id: number;
  environment_quantitative_id: number;
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
   * Get all distinct qualitative enfironment type definition records for all unique qualitative environments for a
   * given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async getQualitativeEnvironmentTypeDefinitions(surveyId: number): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT 
        DISTINCT environment_qualitative.*
      FROM 
        survey_observation
        JOIN observation_subcount 
          ON survey_observation.survey_observation_id = observation_subcount.survey_observation_id
        JOIN observation_subcount_qualitative_environment 
          ON observation_subcount.observation_subcount_id = observation_subcount_qualitative_environment.observation_subcount_id
        JOIN environment_qualitative_environment_qualitative_option 
          ON environment_qualitative_environment_qualitative_option.environment_qualitative_environment_qualitative_option_id = observation_subcount_qualitative_environment.environment_qualitative_environment_qualitative_option_id
        JOIN environment_qualitative 
          ON environment_qualitative_environment_qualitative_option.environment_qualitative_id = environment_qualitative.environment_qualitative_id
      WHERE 
        survey_observation.survey_id = ${surveyId};    
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
  async getQuantitativeEnvironmentTypeDefinitions(surveyId: number): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT
        DISTINCT environment_quantitative.*
      FROM
        survey_observation
        JOIN observation_subcount ON
          survey_observation.survey_observation_id = observation_subcount.survey_observation_id
        JOIN observation_subcount_quantitative_environment
          ON observation_subcount.observation_subcount_id = observation_subcount_quantitative_environment.observation_subcount_id
        JOIN environment_quantitative
          ON observation_subcount_quantitative_environment.environment_quantitative_id = environment_quantitative.environment_quantitative_id
      WHERE
        survey_observation.survey_id = ${surveyId};
  `;

    const response = await this.connection.sql(sqlStatement, QuantitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Find qualitative environment type definitions for a given search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async findQualitativeEnvironmentTypeDefinitions(searchTerm: string): Promise<QualitativeEnvironmentTypeDefinition[]> {
    const sqlStatement = SQL`
      SELECT
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description,
        json_agg(
          json_build_object(
            'environment_qualitative_option_id', environment_qualitative_option.environment_qualitative_option_id,
            'name', environment_qualitative_option.name,
            'description', environment_qualitative_option.description,
            'value', environment_qualitative_option.value
          )
        ) AS options
      FROM
        environment_qualitative
      LEFT JOIN environment_qualitative_environment_qualitative_option
        ON environment_qualitative.environment_qualitative_id = environment_qualitative_environment_qualitative_option.environment_qualitative_id
      LEFT JOIN environment_qualitative_option
        ON environment_qualitative_environment_qualitative_option.environment_qualitative_option_id = environment_qualitative_option.environment_qualitative_option_id
      WHERE
        environment_qualitative.name ILIKE '%' || ${searchTerm} || '%'
      OR 
        environment_qualitative.description ILIKE '%' || ${searchTerm} || '%'
      GROUP BY
        environment_qualitative.environment_qualitative_id,
        environment_qualitative.name,
        environment_qualitative.description;
    `;

    const response = await this.connection.sql(sqlStatement, QualitativeEnvironmentTypeDefinition);

    return response.rows;
  }

  /**
   * Find quantitative environment type definitions for a given search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerm: string
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
        name ILIKE '%' || ${searchTerm} || '%'
      OR 
        description ILIKE '%' || ${searchTerm} || '%';
    `;

    const response = await this.connection.sql(sqlStatement, QuantitativeEnvironmentTypeDefinition);

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
   *       environment_qualitative_environment_qualitative_option_id: number[];
   *       environment_quantitative_id: number[];
   *     }} environmentIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteEnvironmentsForEnvironmentIds(
    surveyId: number,
    environmentIds: {
      environment_qualitative_environment_qualitative_option_id: number[];
      environment_quantitative_id: number[];
    }
  ): Promise<void> {
    await this.deleteQualitativeEnvironmentForEnvironmentIds(
      surveyId,
      environmentIds.environment_qualitative_environment_qualitative_option_id
    );
    await this.deleteQuantitativeEnvironmentForEnvironmentIds(surveyId, environmentIds.environment_quantitative_id);
  }

  /**
   * Delete all qualitative environment records, for all observation records, for a given survey and set of environment
   * ids.
   *
   * @param {number} surveyId
   * @param {number[]} environment_qualitative_environment_qualitative_option_id
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteQualitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_qualitative_environment_qualitative_option_id: number[]
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
      .whereIn(
        'observation_subcount_qualitative_environment.environment_qualitative_environment_qualitative_option_id',
        environment_qualitative_environment_qualitative_option_id
      );

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all quantitative environment records, for all observation records, for a given survey and set of environment
   * ids.
   *
   * @param {number} surveyId
   * @param {number[]} environment_quantitative_id
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountEnvironmentRepository
   */
  async deleteQuantitativeEnvironmentForEnvironmentIds(
    surveyId: number,
    environment_quantitative_id: number[]
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
      .whereIn(
        'observation_subcount_quantitative_environment.environment_quantitative_id',
        environment_quantitative_id
      );

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }
}
