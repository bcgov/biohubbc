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
   * Get all distinct taxon_measurment_ids for all qualitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQualitativeTaxonMeasurements(surveyId: number): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQualitativeTaxonMeasurementIds(surveyId);
  }

  /**
   * Get all distinct taxon_measurment_ids for all quantitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQuantitativeTaxonMeasurements(surveyId: number): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQuantitativeTaxonMeasurementIds(
      surveyId
    );
  }

  async deleteMeasurementsForTaxonMeasurementIds(surveyId: number, ids: string[]): Promise<void> {
    return this.observationSubCountMeasurementRepository.deleteMeasurementsForTaxonMeasurementIds(surveyId, ids);
  }
}
