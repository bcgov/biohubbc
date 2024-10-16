import SQL from 'sql-template-strings';
import { getKnex } from '../../../database/db';
import { BaseRepository } from '../../base-repository';
import { TelemetrySchema } from './telemetry.interface';

export class TelemetryLotekRepository extends BaseRepository {
  /**
   * Get Lotek telemetry data for list of deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<TelemetrySchema[]>}
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'l.telemetry_lotek_id as telemetry_id',
        'd.deployment2_id as deployment_id',
        'c.critter_id',
        'c.critterbase_critter_id',
        'dm.name as device_make',
        knex.raw('l.deviceid::text as serial'),
        'l.uploadtimestamp as acquisition_date',
        'l.latitude',
        'l.longitude',
        'l.altitude as elevation',
        'l.temperature'
      )
      .from('telemetry_lotek as l')
      .join('deployment2 as d', 'l.device_key', 'd.device_key')
      .join('critter as c', 'd.critter_id', 'c.critter_id')
      .join('device as dv', 'd.device_id', 'dv.device_id')
      .join('device_make as dm', 'dv.device_make_id', 'dm.device_make_id')
      .whereIn('d.deployment2_id', deploymentIds)
      .andWhere('d.survey_id', surveyId)
      .andWhere(knex.raw('l.uploadtimestamp::timestamptz >= d.attachment_start'))
      .andWhere(knex.raw('l.uploadtimestamp::timestamptz <= d.attachment_start OR d.attachment_end IS NULL'))
      .orderBy('l.uploadtimestamp', 'asc');

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }

  /**
   * Get a list of deployment ID's with valid lotek credentials.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   */
  async getDeploymentIdsWithValidCredentials(surveyId: number, deploymentIds: number[]): Promise<number[]> {
    const sqlStatement = SQL`
      SELECT
        d.deployment_id,
      FROM
        deployment d
      WHERE
        d.survey_id = ${surveyId}
      AND d.deployment_id IN (${deploymentIds.join(',')})

    `;
    return [];
  }
}
