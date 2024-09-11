import { IDBConnection } from '../database/db';
import { EnvironmentType } from '../repositories/observation-subcount-environment-repository';
import {
  InsertObservationSubCount,
  InsertSubCountEvent,
  ObservationSubCountRecord,
  SubCountEventRecord,
  SubCountRepository
} from '../repositories/subcount-repository';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
import { DBService } from './db-service';
import { ObservationSubCountEnvironmentService } from './observation-subcount-environment-service';
import { ObservationSubCountMeasurementService } from './observation-subcount-measurement-service';

export class SubCountService extends DBService {
  subCountRepository: SubCountRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.subCountRepository = new SubCountRepository(connection);
  }

  /**
   * Inserts a new observation sub count
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubCountRecord>}
   * @memberof SubCountService
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    return this.subCountRepository.insertObservationSubCount(record);
  }

  /**
   * Inserts a new sub count event
   *
   * @param {InsertSubCountEvent} record
   * @returns {*} {Promise<SubCountEventRecord>}
   * @memberof SubCountService
   */
  async insertSubCountEvent(records: InsertSubCountEvent): Promise<SubCountEventRecord> {
    return this.subCountRepository.insertSubCountEvent(records);
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * Note: Also deletes all related child records.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountService
   */
  async deleteObservationSubCountRecords(surveyId: number, surveyObservationIds: number[]): Promise<void> {
    // Delete child subcount_critter records, if any
    await this.subCountRepository.deleteSubCountCritterRecordsForObservationId(surveyId, surveyObservationIds);

    // Delete child observation measurements, if any
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);
    await observationSubCountMeasurementService.deleteObservationMeasurements(surveyId, surveyObservationIds);

    // Delete child environments, if any
    const observationSubCountEnvironmentService = new ObservationSubCountEnvironmentService(this.connection);
    await observationSubCountEnvironmentService.deleteObservationEnvironments(surveyId, surveyObservationIds);

    // Delete observation_subcount records, if any
    return this.subCountRepository.deleteObservationSubCountRecords(surveyId, surveyObservationIds);
  }

  /**
   * Returns a unique set of all measurement type definitions for all measurements of all observations in the given
   * survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<{
   *     qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
   *     quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
   *   }>}
   * @memberof SubCountService
   */
  async getMeasurementTypeDefinitionsForSurvey(surveyId: number): Promise<{
    qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
    quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  }> {
    const observationSubCountMeasurementService = new ObservationSubCountMeasurementService(this.connection);

    // Fetch all unique taxon_measurement_ids for qualitative and quantitative measurements
    const [qualitativeTaxonMeasurementIds, quantitativeTaxonMeasurementIds] = await Promise.all([
      observationSubCountMeasurementService.getObservationSubCountQualitativeTaxonMeasurementIds(surveyId),
      observationSubCountMeasurementService.getObservationSubCountQuantitativeTaxonMeasurementIds(surveyId)
    ]);

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await Promise.all([
      critterbaseService.getQualitativeMeasurementTypeDefinition(qualitativeTaxonMeasurementIds),
      critterbaseService.getQuantitativeMeasurementTypeDefinition(quantitativeTaxonMeasurementIds)
    ]);

    return { qualitative_measurements: response[0], quantitative_measurements: response[1] };
  }

  /**
   * Returns a unique set of all environment type definitions for all environments of all observations in the given
   * survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<EnvironmentType>}
   * @memberof SubCountService
   */
  async getEnvironmentTypeDefinitionsForSurvey(surveyId: number): Promise<EnvironmentType> {
    const observationSubCountEnvironmentService = new ObservationSubCountEnvironmentService(this.connection);

    const [qualitativeEnvironmentTypeDefinitions, quantitativeEnvironmentTypeDefinitions] = await Promise.all([
      observationSubCountEnvironmentService.getQualitativeEnvironmentTypeDefinitionsForSurvey(surveyId),
      observationSubCountEnvironmentService.getQuantitativeEnvironmentTypeDefinitionsForSurvey(surveyId)
    ]);

    return {
      qualitative_environments: qualitativeEnvironmentTypeDefinitions,
      quantitative_environments: quantitativeEnvironmentTypeDefinitions
    };
  }
}
