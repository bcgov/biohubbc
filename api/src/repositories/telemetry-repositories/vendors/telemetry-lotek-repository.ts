import { Knex } from 'knex';
import { getKnex } from '../../../database/db';
import { BaseRepository } from '../../base-repository';
import { TelemetrySchema } from './telemetry.interface';

export class TelemetryLotekRepository extends BaseRepository {
  _getLotekTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number[]): Knex.QueryBuilder {
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

    return queryBuilder;
  }

  /**
   * Get Lotek telemetry data by deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<TelemetrySchema[]>}
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const queryBuilder = this._getLotekTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds);

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

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
  async deploymentHasValidCredentials(surveyId: number, deploymentIds: number[]): Promise<boolean> {
    console.log(surveyId, deploymentIds);
    return true;
    //const sqlStatement = SQL`
    //  SELECT
    //    d.deployment_id
    //  FROM telemetry_credential_lotek lc
    //  JOIN survey_telemetry_vendor_credential sc
    //  ON lc.device_key = sc.device_key
    //  JOIN survey_telemetry_credential_attachment sa
    //  ON sc.survey_telemetry_vendor_credential_id = sa.survey_telemetry_vendor_credential_id
    //  JOIN survey s
    //  ON sa.survey_id = s.survey_id
    //  JOIN deployment2 d
    //  ON s.survey_id = d.survey_id
    //  WHERE sa.survey_id = ${surveyId}
    //  AND d.deployment_id IN ('${deploymentIds.join("','")}')
    //  AND lc.is_valid = TRUE;
    //`;
    //const response = await this.connection.sql(sqlStatement, z.object({ deployment_id: z.number() }));
    //
    //return response.rows.map((row) => row.deployment_id);
  }
}
