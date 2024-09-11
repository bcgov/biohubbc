import { Readable } from 'stream';
import { IDBConnection } from '../../../database/db';
import { DBService } from '../../db-service';
import { TelemetryService } from '../../telemetry-service';
import { ExportDataStreamOptions, ExportStrategy, ExportStrategyConfig } from '../export-strategy';

// const defaultLog = getLogger('ExportTelemetryStrategy');

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
            fileName: 'telemetry.json'
          }
        ]
      };
    } catch (error) {
      console.error('Error generating observation export strategy config.', error);
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
    const telemetryService = new TelemetryService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const stream = new Readable({
      objectMode: true,
      read() {
        telemetryService
          .findTelemetry(isUserAdmin, systemUserId, filterFields)
          .then((telemetry) => {
            for (const item of telemetry) {
              this.push(item);
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
}
