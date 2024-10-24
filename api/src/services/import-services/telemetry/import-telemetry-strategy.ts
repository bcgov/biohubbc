import dayjs from 'dayjs';
import { z } from 'zod';
import { TelemetryManualRecord } from '../../../database-models/telemetry_manual';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { DBService } from '../../db-service';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { CSVImportStrategy, Row } from '../import-csv.interface';

/**
 * ImportTelemetryStrategy
 *
 * @export
 *
 * @class
 * @extends {DBService}
 * @implements {CSVImportStrategy}
 */
export class ImportTelemetryStrategy extends DBService implements CSVImportStrategy {
  surveyId: number;

  telemetryVendorService: TelemetryVendorService;

  /**
   * An XLSX validation config for the standard columns of a SIMS Telemetry CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer keyof type, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    SERIAL: { type: 'stringOrNumber', aliases: ['DEVICE_ID'] }, // 1234
    VENDOR: { type: 'string' }, // lotek
    LATITUDE: { type: 'number', aliases: CSV_COLUMN_ALIASES.LATITUDE },
    LONGITUDE: { type: 'number', aliases: CSV_COLUMN_ALIASES.LONGITUDE },
    DATE: { type: 'date' },
    TIME: { type: 'string', optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Construct an instance of ImportTelemetryStrategy.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {number} surveyId
   */
  constructor(connection: IDBConnection, surveyId: number) {
    super(connection);

    this.surveyId = surveyId;

    this.telemetryVendorService = new TelemetryVendorService(connection);
  }

  /**
   * Validate the CSV rows against zod schema.
   *
   * @param {Row[]} rows - CSV rows
   * @returns {*}
   */
  async validateRows(rows: Row[]) {
    const getColumnCell = generateColumnCellGetterFromColumnValidator(this.columnValidator);
    const deployments = await this.telemetryVendorService.deploymentService.getDeploymentsForSurveyId(this.surveyId);

    const rowsToValidate: Partial<TelemetryManualRecord>[] = [];

    for (const row of rows) {
      // Raw column cell values
      const vendor = getColumnCell(row, 'VENDOR').cell.toLowerCase();
      const serial = getColumnCell(row, 'SERIAL').cell;
      const latitude = getColumnCell(row, 'LATITUDE').cell;
      const longitude = getColumnCell(row, 'LONGITUDE').cell;
      const date = getColumnCell(row, 'DATE').cell;
      const time = getColumnCell(row, 'TIME').cell;

      // Format additional values
      const timestamp = dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm:ss');
      const deviceKey = getTelemetryDeviceKey({ vendor, serial });

      // Find the deployment that matches the device key and is within the telemetry date range
      // This is making the assumption that only one match can be found (database date/deviceKey constraints)
      const deployment = deployments.find((deployment) => {
        const telemetryWithinDeployment =
          timestamp >= deployment.attachment_start_timestamp &&
          (deployment.attachment_end_timestamp === null || timestamp <= deployment.attachment_end_timestamp);

        return deployment.device_key === deviceKey && telemetryWithinDeployment;
      });

      // Push the row to validate into the array
      rowsToValidate.push({
        deployment2_id: deployment?.deployment2_id,
        latitude: latitude,
        longitude: longitude,
        acquisition_date: timestamp,
        transmission_date: null
      });
    }

    // Validate the rows against the zod schema
    return z
      .array(
        z.object({
          deployment2_id: z.number({
            required_error: `Unable to infer matching deployment with vendor and serial. Make sure telemetry date and time intersect with deployment attachment start and end dates.`
          }),
          latitude: z.number(),
          longitude: z.number(),
          acquisition_date: z.string(),
          transmission_date: z.string().nullable()
        })
      )
      .safeParse(rowsToValidate);
  }

  /**
   * Insert manual telemetry into SIMS.
   *
   * @async
   * @param {TelemetryManualRecord[]} telemetry - Parsed CSV telemetry
   * @returns {Promise<void>}
   */
  async insert(telemetry: TelemetryManualRecord[]): Promise<void> {
    return this.telemetryVendorService.bulkCreateManualTelemetry(this.surveyId, telemetry);
  }
}
