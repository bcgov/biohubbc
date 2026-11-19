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

  /**
   * Insert qualitative measurement records.
   *
   * @param {InsertObservationSubCountQualitativeMeasurementRecord[]} data
   * @return {*}  {Promise<ObservationSubCountQualitativeMeasurementRecord[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async insertObservationSubCountQualitativeMeasurement(
    data: InsertObservationSubCountQualitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQualitativeMeasurementRecord[]> {
    return this.observationSubCountMeasurementRepository.insertObservationQualitativeMeasurementRecords(data);
  }

  /**
   * Insert quantitative measurement records.
   *
   * @param {InsertObservationSubCountQuantitativeMeasurementRecord[]} data
   * @return {*}  {Promise<ObservationSubCountQuantitativeMeasurementRecord[]>}
   * @memberof ObservationSubCountMeasurementService
   */
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
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQualitativeTaxonMeasurementIdsForSurvey(
    surveyId: number,
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQualitativeTaxonMeasurementIds(
      surveyId,
      options
    );
  }

  /**
   * Get all distinct taxon_measurment_ids for all quantitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementService
   */
  async getObservationSubCountQuantitativeTaxonMeasurementIdsForSurvey(
    surveyId: number,
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<string[]> {
    return this.observationSubCountMeasurementRepository.getObservationSubCountQuantitativeTaxonMeasurementIds(
      surveyId,
      options
    );
  }

  /**
   * Delete all measurement records for a given survey and set of observation subcount ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubCountIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountMeasurementService
   */
  async deleteMeasurementsByObservationSubCountId(surveyId: number, observationSubCountIds: number[]): Promise<void> {
    return this.observationSubCountMeasurementRepository.deleteMeasurementsByObservationSubCountId(
      surveyId,
      observationSubCountIds
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
