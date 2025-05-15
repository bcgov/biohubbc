import { ObservationEnvironmentQualitativeModel } from '../database-models/observation_environment_qualitative';
import { ObservationEnvironmentQuantitativeModel } from '../database-models/observation_environment_quantitative';
import { IDBConnection } from '../database/db';
import {
  InsertObservationQualitativeEnvironmentRecord,
  InsertObservationQuantitativeEnvironmentRecord,
  ObservationEnvironmentRepository,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../repositories/observation-environment-repository';
import { ObservationEnvironments } from '../repositories/observation-repository/observation-repository.interface';
import { DBService } from './db-service';

export class ObservationEnvironmentService extends DBService {
  observationEnvironmentRepository: ObservationEnvironmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationEnvironmentRepository = new ObservationEnvironmentRepository(connection);
  }

  /**
   * Insert qualitative environment records.
   *
   * @param {InsertObservationQualitativeEnvironmentRecord[]} data
   * @return {*}  {Promise<ObservationEnvironmentQualitativeModel[]>}
   * @memberof ObservationEnvironmentService
   */
  async insertObservationQualitativeEnvironment(
    data: InsertObservationQualitativeEnvironmentRecord[]
  ): Promise<ObservationEnvironmentQualitativeModel[]> {
    return this.observationEnvironmentRepository.insertObservationQualitativeEnvironmentRecords(data);
  }

  /**
   * Insert quantitative environment records.
   *
   * @param {InsertObservationQuantitativeEnvironmentRecord[]} data
   * @return {*}  {Promise<ObservationEnvironmentQuantitativeModel[]>}
   * @memberof ObservationEnvironmentService
   */
  async insertObservationQuantitativeEnvironment(
    data: InsertObservationQuantitativeEnvironmentRecord[]
  ): Promise<ObservationEnvironmentQuantitativeModel[]> {
    return this.observationEnvironmentRepository.insertObservationQuantitativeEnvironmentRecords(data);
  }

  /**
   * Deletes all environments for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationEnvironmentService
   */
  async deleteObservationEnvironments(surveyId: number, surveyObservationId: number[]) {
    await this.observationEnvironmentRepository.deleteObservationEnvironments(surveyId, surveyObservationId);
  }

  /**
   * Get environment qualitative type definitions for the given environment record ids (uuid).
   *
   * @param {string[]} environmentQualitativeIds
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async getQualitativeEnvironmentTypeDefinitions(
    environmentQualitativeIds: string[]
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.getQualitativeEnvironmentTypeDefinitions(environmentQualitativeIds);
  }

  /**
   * Find environment quantitative type definitions for the given environment record ids (uuid)
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async getQuantitativeEnvironmentTypeDefinitions(
    environmentQuantitativeIds: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.getQuantitativeEnvironmentTypeDefinitions(environmentQuantitativeIds);
  }

  /**
   * Get all distinct environment qualitative type definitions for all qualitative environments for a given survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async getQualitativeEnvironmentTypeDefinitionsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.getQualitativeEnvironmentTypeDefinitionsForSurveys(surveyIds, options);
  }

  /**
   * Get all distinct environment quantitative type definitions for all quantitative environments for a given survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async getQuantitativeEnvironmentTypeDefinitionsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.getQuantitativeEnvironmentTypeDefinitionsForSurvey(surveyIds, options);
  }

  /**
   * Find environment qualitative type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async findQualitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.findQualitativeEnvironmentTypeDefinitions(searchTerms);
  }

  /**
   * Find environment quantitative type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationEnvironmentService
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationEnvironmentRepository.findQuantitativeEnvironmentTypeDefinitions(searchTerms);
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
   * @memberof ObservationEnvironmentService
   */
  async deleteEnvironmentsForEnvironmentIds(
    surveyId: number,
    environmentIds: {
      environment_qualitative_id: string[];
      environment_quantitative_id: string[];
    }
  ): Promise<void> {
    return this.observationEnvironmentRepository.deleteEnvironmentsForEnvironmentIds(surveyId, environmentIds);
  }

  /**
   * Returns a unique set of all environment type definitions for all environments of all observations in the given
   * survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<ObservationEnvironments>}
   * @memberof ObservationEnvironmentService
   */
  async getEnvironmentTypeDefinitionsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<ObservationEnvironments> {
    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    const [qualitativeEnvironmentTypeDefinitions, quantitativeEnvironmentTypeDefinitions] = await Promise.all([
      observationEnvironmentService.getQualitativeEnvironmentTypeDefinitionsForSurveys(surveyIds, options),
      observationEnvironmentService.getQuantitativeEnvironmentTypeDefinitionsForSurveys(surveyIds, options)
    ]);

    return {
      qualitative_environments: qualitativeEnvironmentTypeDefinitions,
      quantitative_environments: quantitativeEnvironmentTypeDefinitions
    };
  }
}
