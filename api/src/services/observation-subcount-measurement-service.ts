import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCountQualitativeMeasurementRecord,
  InsertObservationSubCountQuantitativeMeasurementRecord,
  ObservationSubCountMeasurementRepository,
  ObservationSubCountQualitativeMeasurementRecord,
  ObservationSubCountQuantitativeMeasurementRecord
} from '../repositories/observation-subcount-measurement-repository';
import { DBService } from './db-service';

export class ObservationSubCountMeasurementService extends DBService {
  observationSubCountMeasurementRepository: ObservationSubCountMeasurementRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationSubCountMeasurementRepository = new ObservationSubCountMeasurementRepository(connection);
  }

  async insertObservationSubCountQualitativeMeasurement(
    data: InsertObservationSubCountQualitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQualitativeMeasurementRecord[]> {
    return this.observationSubCountMeasurementRepository.insertObservationQualitativeMeasurementRecords(data);
  }

  async insertObservationSubCountQuantitativeMeasurement(
    data: InsertObservationSubCountQuantitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQuantitativeMeasurementRecord[]> {
    return this.observationSubCountMeasurementRepository.insertObservationQuantitativeMeasurementRecords(data);
  }

  /**
   * Deletes all observation measurements for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationSubCountMeasurementService
   */
  async deleteObservationMeasurements(surveyId: number, surveyObservationId: number[]) {
    await this.observationSubCountMeasurementRepository.deleteObservationMeasurements(surveyId, surveyObservationId);
  }

  /**
   * Get all distinct taxon_measurment_ids for all qualitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQualitativeTaxonMeasurementIds(surveyId: number): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQualitativeTaxonMeasurementIds(surveyId);
  }

  /**
   * Get all distinct taxon_measurment_ids for all quantitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQuantitativeTaxonMeasurementIds(surveyId: number): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQuantitativeTaxonMeasurementIds(
      surveyId
    );
  }

  /**
   * Delete all measurement records, for all observation records, for a given survey and set of measurement ids.
   *
   * @param {number} surveyId
   * @param {string[]} measurementIds Critterbase taxon measurement ids to delete
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountMeasurementService
   */
  async deleteMeasurementsForTaxonMeasurementIds(surveyId: number, measurementIds: string[]): Promise<void> {
    return this.observationSubCountMeasurementRepository.deleteMeasurementsForTaxonMeasurementIds(
      surveyId,
      measurementIds
    );
  }
}
