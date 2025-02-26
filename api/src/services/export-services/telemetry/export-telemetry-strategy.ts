import { Readable } from 'stream';
import { IDBConnection } from '../../../database/db';
import { Telemetry } from '../../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { ExportDataStreamOptions, ExportStrategy, ExportStrategyConfig } from '../export-strategy';
import { parseDateAndTimeString } from '../export-utils';

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
        streams: [
          {
            stream: this._getStream,
            fileName: 'telemetry.csv'
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
              this.push(ExportTelemetryStrategy.generateTelemetryCSV(item));
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

  static generateTelemetryCSV = (item: Telemetry): string => {
    const { dateStr, timeStr } = parseDateAndTimeString(item.acquisition_date);
    return [
      item.telemetry_id,
      `${item.vendor}:${item.serial}`,
      item.deployment_id,
      item.latitude,
      item.longitude,
      dateStr,
      timeStr
    ].join(',');
  };
}
