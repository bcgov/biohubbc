import dayjs from 'dayjs';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CreateManualTelemetry } from '../../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { DBService } from '../../db-service';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { CSVImportStrategy, Row } from '../import-csv.interface';
import { CsvManualTelemetry, CsvManualTelemetrySchema } from './import-telemetry-strategy.interface';

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
    SERIAL: { type: 'string' }, // 1234
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

    const rowsToValidate: CreateManualTelemetry[] = [];

    for (const row of rows) {
      const serial = getColumnCell(row, 'SERIAL').cell;
      const vendor = getColumnCell(row, 'VENDOR').cell;

      const latitude = getColumnCell(row, 'LATITUDE').cell;
      const longitude = getColumnCell(row, 'LONGITUDE').cell;
      const date = getColumnCell(row, 'DATE').cell;
      const time = getColumnCell(row, 'TIME').cell;

      const telemetryDate = dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm:ss');

      rowsToValidate.push({
        deployment2_id: deploymentId,
        latitude: latitude,
        longitude: longitude,
        acquisition_date: telemetryDate,
        transmission_date: null
      });
    }

    return z.array(CsvManualTelemetrySchema).safeParse(rowsToValidate);
  }

  /**
   * Insert manual telemetry into SIMS.
   *
   * @async
   * @param {CsvManualTelemetry[]} telemetry - Parsed CSV telemetry
   * @returns {Promise<void>}
   */
  async insert(telemetry: CsvManualTelemetry[]): Promise<void> {
    return this.telemetryVendorService.bulkCreateManualTelemetry(this.surveyId, telemetry);
  }
}
