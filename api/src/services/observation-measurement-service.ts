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
}
