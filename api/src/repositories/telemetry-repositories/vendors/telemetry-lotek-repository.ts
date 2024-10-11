import SQL from 'sql-template-strings';
import { BaseRepository } from '../../base-repository';
import { TelemetrySchema } from './telemetry-repository.interface';

export class TelemetryLotekRepository extends BaseRepository {
  async getLotekAndManualTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const sqlStatement = SQL`
      SELECT *
      FROM telemetry_lotek l
      JOIN deployment d
      ON l.device_key = d.device_key
      WHERE d.deployment_id IN ('${deploymentIds.join("','")}')
      AND d.survey_id = ${surveyId}
      AND l.acquisition_time >= d.attachment_start
      AND (l.acquisition_time <= d.attachment_end OR d.attachment_end IS NULL)
      ORDER BY l.acquisition_time ASC;
    `;

    const response = await this.connection.sql(sqlStatement, TelemetrySchema);

    return response.rows;
  }

  /**
   * Get a list of valid lotek credentials for a list deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   *
   */
  async getValidCredentialsForDeploymentIds(surveyId: number, deploymentIds: number[]) {
    return [];
  }
}
