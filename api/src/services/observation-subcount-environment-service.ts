import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCountQualitativeEnvironmentRecord,
  InsertObservationSubCountQuantitativeEnvironmentRecord,
  ObservationSubCountEnvironmentRepository,
  ObservationSubCountQualitativeEnvironmentRecord,
  ObservationSubCountQuantitativeEnvironmentRecord,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../repositories/observation-subcount-environment-repository';
import { DBService } from './db-service';

export class ObservationSubCountEnvironmentService extends DBService {
  observationSubCountEnvironmentRepository: ObservationSubCountEnvironmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationSubCountEnvironmentRepository = new ObservationSubCountEnvironmentRepository(connection);
  }

  async insertObservationSubCountQualitativeEnvironment(
    data: InsertObservationSubCountQualitativeEnvironmentRecord[]
  ): Promise<ObservationSubCountQualitativeEnvironmentRecord[]> {
    return this.observationSubCountEnvironmentRepository.insertObservationQualitativeEnvironmentRecords(data);
  }

  async insertObservationSubCountQuantitativeEnvironment(
    data: InsertObservationSubCountQuantitativeEnvironmentRecord[]
  ): Promise<ObservationSubCountQuantitativeEnvironmentRecord[]> {
    return this.observationSubCountEnvironmentRepository.insertObservationQuantitativeEnvironmentRecords(data);
  }

  /**
   * Deletes all environments for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationSubCountEnvironmentService
   */
  async deleteObservationEnvironments(surveyId: number, surveyObservationId: number[]) {
    await this.observationSubCountEnvironmentRepository.deleteObservationEnvironments(surveyId, surveyObservationId);
  }

  /**
   * Get all distinct environment qualitative type definitions for all qualitative environments for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async getQualitativeEnvironmentTypeDefinitions(surveyId: number): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.getQualitativeEnvironmentTypeDefinitions(surveyId);
  }

  /**
   * Get all distinct environment quantitative type definitions for all quantitative environments for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async getQuantitativeEnvironmentTypeDefinitions(surveyId: number): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.getQuantitativeEnvironmentTypeDefinitions(surveyId);
  }

  /**
   * Find environment qualitative type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async findQualitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.findQualitativeEnvironmentTypeDefinitions(searchTerms);
  }

  /**
   * Find environment quantitative type definitions for the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerms: string[]
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.findQuantitativeEnvironmentTypeDefinitions(searchTerms);
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
   * @memberof ObservationSubCountEnvironmentService
   */
  async deleteEnvironmentsForEnvironmentIds(
    surveyId: number,
    environmentIds: {
      environment_qualitative_id: string[];
      environment_quantitative_id: string[];
    }
  ): Promise<void> {
    return this.observationSubCountEnvironmentRepository.deleteEnvironmentsForEnvironmentIds(surveyId, environmentIds);
  }
}
