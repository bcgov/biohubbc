import SQL from 'sql-template-strings';
import { DBService } from '../../../services/db-service';

export class TelemetryVendorService extends DBService {
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const sqlStatement = SQL`
      SELECT
    `;
  }
}
