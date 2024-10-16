import { getKnex } from '../../../database/db';
import { BaseRepository } from '../../base-repository';
import { TelemetrySchema, TelemetryVendorEnum } from './telemetry.interface';

export class TelemetryVendorRepository extends BaseRepository {
  getLotekTelemetryBaseQuery() {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_lotek.telemetry_lotek_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'critter.critter_id',
        'critter.critterbase_critter_id',
        knex.raw(`'${TelemetryVendorEnum.LOTEK}' as vendor`),
        knex.raw('telemetry_lotek.deviceid::text as serial'),
        knex.raw('deployment2.attachment_start::timestamptz'),
        knex.raw('deployment2.attachment_end::timestamptz'),
        knex.raw('telemetry_lotek.uploadtimestamp::timestamptz as acquisition_date'),
        'telemetry_lotek.latitude',
        'telemetry_lotek.longitude',
        'telemetry_lotek.altitude as elevation',
        'telemetry_lotek.temperature'
      )
      .from('telemetry_lotek')
      .join('deployment2', 'telemetry_lotek.device_key', 'deployment2.device_key')
      .join('critter', 'deployment2.critter_id', 'critter.critter_id');

    return queryBuilder;
  }

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
      .queryBuilder()
      .with('telemetry', (withQueryBuilder) => {
        withQueryBuilder.union(
          this.getLotekTelemetryBaseQuery()
            .whereIn('deployment2.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId)
        );
      })
      .select(
        'telemetry_id',
        'deployment_id',
        'critter_id',
        'critterbase_critter_id',
        'vendor',
        'serial',
        'acquisition_date',
        'latitude',
        'longitude',
        'elevation',
        'temperature'
      )
      .from('telemetry')
      .where(knex.raw('telemetry.acquisition_date >= telemetry.attachment_start'))
      .andWhere(
        knex.raw('telemetry.acquisition_date <= telemetry.attachment_start OR telemetry.attachment_end IS NULL')
      )
      .orderBy('telemetry.acquisition_date', 'desc');

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }
}
