import { uniq } from 'lodash';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { getNonStandardColumnNamesFromWorksheet, IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportService, Row } from '../csv-import-strategy.interface';
import { CsvMeasurement, CsvMeasurementSchema } from './import-measurements-strategy.interface';

//const defaultLog = getLogger('services/import/import-critters-service');

/**
 *
 * ImportMeasurementsStrategy - Injected into CSVImportStrategy as the CSV import dependency
 *
 * @example new CSVImport(new ImportMeasurementsStrategy(connection, surveyId)).import(file);
 *
 * @class ImportCrittersService
 * @extends DBService
 *
 */
export class ImportMeasurementsStrategy extends DBService implements CSVImportService {
  surveyCritterService: SurveyCritterService;

  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Measurement CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer key types, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ALIAS: { type: 'number', aliases: CSV_COLUMN_ALIASES.ALIAS },
    CAPTURE_DATE: { type: 'date' },
    CAPTURE_TIME: { type: 'string', optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Instantiates an instance of ImportMeasurementsStrategy
   *
   * @param {IDBConnection} connection - Database connection
   * @param {number} surveyId - Survey identifier
   */
  constructor(connection: IDBConnection, surveyId: number) {
    super(connection);

    this.surveyId = surveyId;

    this.surveyCritterService = new SurveyCritterService(connection);
  }

  /**
   * Get non-standard columns (measurement columns) from worksheet.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {string[]} Array of non-standard headers from CSV (worksheet)
   */
  _getNonStandardColumns(worksheet: WorkSheet) {
    return uniq(getNonStandardColumnNamesFromWorksheet(worksheet, this.columnValidator));
  }

  /**
   * Validate CSV worksheet rows against reference data.
   *
   * @async
   * @param {Row[]} rows - Invalidated CSV rows
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {*}
   */
  async validateRows(rows: Row[], worksheet: WorkSheet) {
    const nonStandardColumns = this._getNonStandardColumns(worksheet);

    const rowsToValidate: CsvMeasurement[] = [];

    for (const row of rows) {
      for (const column of nonStandardColumns) {
        const measurement = row[column];
        if (measurement) {
          rowsToValidate.push({
            critter_id: '',
            capture_id: '',
            taxon_measurement_id: '',
            value: ''
          });
        }
      }
    }

    return z.array(CsvMeasurementSchema).safeParseAsync(rowsToValidate);
  }

  /**
   * Insert CSV measurements into Critterbase.
   *
   * @async
   * @param {CsvCritter[]} critterRows - CSV row measurements
   * @returns {Promise<number[]>} List of inserted measurements
   */
  async insert(critterRows: CsvMeasurement[]): Promise<number[]> {
    console.log(critterRows);
  }
}
