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
   * Find environment qualitative type definitions for a given search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<QualitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async findQualitativeEnvironmentTypeDefinitions(searchTerm: string): Promise<QualitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.findQualitativeEnvironmentTypeDefinitions(searchTerm);
  }

  /**
   * Find environment quantitative type definitions for a given search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<QuantitativeEnvironmentTypeDefinition[]>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async findQuantitativeEnvironmentTypeDefinitions(
    searchTerm: string
  ): Promise<QuantitativeEnvironmentTypeDefinition[]> {
    return this.observationSubCountEnvironmentRepository.findQuantitativeEnvironmentTypeDefinitions(searchTerm);
  }

  /**
   * Delete all environment records, for all observation records, for a given survey and set of environment ids.
   *
   * @param {number} surveyId
   * @param {{
   *       environment_qualitative_id: number[];
   *       environment_quantitative_id: number[];
   *     }} environmentIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountEnvironmentService
   */
  async deleteEnvironmentsForEnvironmentIds(
    surveyId: number,
    environmentIds: {
      environment_qualitative_id: number[];
      environment_quantitative_id: number[];
    }
  ): Promise<void> {
    return this.observationSubCountEnvironmentRepository.deleteEnvironmentsForEnvironmentIds(surveyId, environmentIds);
  }
}
