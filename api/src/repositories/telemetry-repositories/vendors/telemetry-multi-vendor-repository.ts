import { IDBConnection } from '../../../database/db';
import { DBService } from '../../../services/db-service';
import { TelemetryLotekRepository } from './telemetry-lotek-repository';
import { TelemetrySchema } from './telemetry.interface';

export class TelemetryMultiVendorRepository extends DBService {
  lotekRepository: TelemetryLotekRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.lotekRepository = new TelemetryLotekRepository(connection);
  }

  async getTelemetryByDeploymentId(surveyId: number, deploymentId: number) {}

  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const lotekQueryBuilder = this.lotekRepository._getLotekTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds);

    // TODO: union telemetry data from other vendors

    const response = await this.connection.knex(lotekQueryBuilder, TelemetrySchema);

    return response.rows;
  }
}
