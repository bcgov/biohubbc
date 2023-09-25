import { GeoJsonProperties } from 'geojson';
import { IDBConnection } from '../database/db';
import { ObservationRepository } from '../repositories/observation-repository';
import { DBService } from './db-service';

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

}
