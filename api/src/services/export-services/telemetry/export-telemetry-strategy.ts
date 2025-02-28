import { Readable } from 'stream';
import { getKnex, IDBConnection } from '../../../database/db';
import { TelemetryVendorRepository } from '../../../repositories/telemetry-repositories/telemetry-vendor-repository';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { ExportDataStreamOptions, ExportStrategy, ExportStrategyConfig } from '../export-strategy';
import { parseTimestampString } from '../export-utils';

const defaultLog = getLogger('services/export-telemetry-strategy');

export type ExportTelemetryConfig = {
  surveyId: number;
  isUserAdmin: boolean;
};

/**
 * Provides functionality for exporting telemetry data.
 *
 * @export
 * @class ExportTelemetryStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
 */
export class ExportTelemetryStrategy extends DBService implements ExportStrategy {
  config: ExportTelemetryConfig;

  constructor(config: ExportTelemetryConfig, connection: IDBConnection) {
    super(connection);

    this.config = config;
  }

  /**
   * Get the export strategy configuration for the telemetry data.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportTelemetryStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      return {
        queries: [
          {
            sql: this._getSql(),
            fileName: 'telemetry.csv',
            csvHeader: ['Telemetry ID', 'Device ID', 'Deployment ID', 'Latitude', 'Logitude', 'Date', 'Time'].join(','),
            transformFunction: ExportTelemetryStrategy.telemetryCsvTransformation
          }
        ]
      };
    } catch (error) {
      defaultLog.error({
        label: 'getExportStrategyConfig',
        message: 'Error generating export strategy config.',
        error
      });

      throw error;
    }
  }

  /**
   * Build and return the survey metadata data sql query.
   *
   * @memberof ExportSurveyMetadataStrategy
   */
  _getSql = () => {
    const telemetryVendorRepository = new TelemetryVendorRepository(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const knex = getKnex();
    return telemetryVendorRepository.buildTelemetryQuery(knex, isUserAdmin, systemUserId, filterFields);
  };

  /**
   * Build and return the telemetry data stream.
   *
   * @param {ExportDataStreamOptions} _options
   * @memberof ExportTelemetryStrategy
   */
  _getStream = (_options: ExportDataStreamOptions): Readable => {
    const telemetryVendorService = new TelemetryVendorService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const csvTelemetryHeader = [
      'Telemetry ID',
      'Device ID',
      'Deployment ID',
      'Latitude',
      'Logitude',
      'Date',
      'Time'
    ].join(',');

    const stream = new Readable({
      objectMode: true,
      read() {
        telemetryVendorService
          .findTelemetry(isUserAdmin, systemUserId, filterFields)
          .then((telemetry) => {
            this.push(csvTelemetryHeader);
            for (const item of telemetry) {
              this.push(ExportTelemetryStrategy.telemetryCsvTransformation(item));
            }

            // Signal the end of the stream
            this.push(null);
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });

    return stream;
  };

  /**
   * Transform query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportTelemetryStrategy
   */
  static readonly telemetryCsvTransformation = (item: Record<string, any>): string => {
    const { dateStr, timeStr } = parseTimestampString(item.acquisition_date);
    return [
      item.telemetry_id,
      getTelemetryDeviceKey({ vendor: item.vendor, serial: item.serial }),
      item.deployment_id,
      item.latitude,
      item.longitude,
      dateStr,
      timeStr
    ].join(',');
  };
}
