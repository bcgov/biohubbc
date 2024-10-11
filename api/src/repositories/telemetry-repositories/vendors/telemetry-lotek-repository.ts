import SQL from 'sql-template-strings';
import { z } from 'zod';
import { BaseRepository } from '../../base-repository';
import { TelemetrySchema } from './telemetry.interface';

export class TelemetryLotekRepository extends BaseRepository {
  /**
   * Get Lotek and manual telemetry data by deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<TelemetrySchema[]>}
   */
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
   * Get a list of deployment ID's with valid lotek credentials.
   *
   * BCTW-MIGRATION-TODO: replace reference of `deployment2` to `deployment` once data fully migrated
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   */
  async getDeploymentIdsWithValidLotekCredentials(surveyId: number, deploymentIds: number[]): Promise<number[]> {
    const sqlStatement = SQL`
      SELECT
        d.deployment_id
      FROM telemetry_credential_lotek lc
      JOIN survey_telemetry_vendor_credential sc
      ON lc.device_key = sc.device_key
      JOIN survey_telemetry_credential_attachment sa
      ON sc.survey_telemetry_vendor_credential_id = sa.survey_telemetry_vendor_credential_id
      JOIN survey s
      ON sa.survey_id = s.survey_id
      JOIN deployment2 d
      ON s.survey_id = d.survey_id
      WHERE sa.survey_id = ${surveyId}
      AND d.deployment_id IN ('${deploymentIds.join("','")}')
      AND lc.is_valid = TRUE;
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ deployment_id: z.number() }));

    return response.rows.map((row) => row.deployment_id);
  }
}
