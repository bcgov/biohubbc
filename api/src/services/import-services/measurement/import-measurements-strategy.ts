import { uniq } from 'lodash';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateColumnCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { getNonStandardColumnNamesFromWorksheet, IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICritterDetailed
} from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportStrategy, Row, Validation, ValidationError } from '../import-csv.interface';
import { findCapturesFromDateTime } from '../utils/datetime';
import { CsvMeasurement } from './import-measurements-strategy.interface';

/**
 *
 * ImportMeasurementsStrategy - Injected into importCSV as the CSV import dependency
 *
 * @example new CSVImport(new ImportMeasurementsStrategy(connection, surveyId)).import(file);
 *
 * @class ImportMeasurementsStrategy
 * @extends DBService
 *
 */
export class ImportMeasurementsStrategy extends DBService implements CSVImportStrategy {
  surveyCritterService: SurveyCritterService;

  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Measurement CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer key types, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
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

  async _getTsnsMeasurementMap(tsns: string[]) {
    const tsnMeasurementMap = new Map<
      string,
      {
        qualitative: CBQualitativeMeasurementTypeDefinition[];
        quantitative: CBQuantitativeMeasurementTypeDefinition[];
      }
    >();

    const uniqueTsns = [...new Set(tsns)];
    const measurements = await Promise.all(
      uniqueTsns.map((tsn) => this.surveyCritterService.critterbaseService.getTaxonMeasurements(tsn))
    );

    uniqueTsns.forEach((tsn, index) => {
      tsnMeasurementMap.set(tsn, measurements[index]);
    });

    return tsnMeasurementMap;
  }

  _getRowMeta(
    row: Row,
    critterAliasMap: Map<string, ICritterDetailed | undefined>
  ): { capture_id?: string; critter_id?: string; tsn?: string } {
    const getColumnCell = generateColumnCellGetterFromColumnValidator(this.columnValidator);

    const alias = getColumnCell<string>(row, 'ALIAS');
    const captureDate = getColumnCell(row, 'CAPTURE_DATE');
    const captureTime = getColumnCell(row, 'CAPTURE_TIME');

    let capture_id, critter_id, tsn;

    if (alias.cell) {
      const critter = critterAliasMap.get(alias.cell.toLowerCase());

      if (critter) {
        const captures = findCapturesFromDateTime(critter.captures, captureDate.cell, captureTime.cell);
        critter_id = critter.critter_id;
        capture_id = captures.length === 1 ? captures[0].capture_id : undefined;
        tsn = String(critter.itis_tsn); // Cast to string for convienience
      }
    }

    return { critter_id, capture_id, tsn };
  }

  /**
   * Validate CSV worksheet rows against reference data.
   *
   * @async
   * @param {Row[]} rows - Invalidated CSV rows
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {*}
   */
  async validateRows(rows: Row[], worksheet: WorkSheet): Promise<Validation<any>> {
    // Generate type-safe cell getter from column validator
    const nonStandardColumns = this._getNonStandardColumns(worksheet);

    const critterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);

    const rowErrors: ValidationError[] = [];
    const rowTsns: string[] = [];

    // Collect the tsns from the rows
    rows.forEach((row) => {
      const tsn = this._getRowMeta(row, critterAliasMap).tsn;
      if (tsn) {
        rowTsns.push(tsn);
      }
    });

    const tsnMeasurementsMap = await this._getTsnsMeasurementMap(rowTsns);

    rows.forEach((row, index) => {
      const { critter_id, capture_id, tsn } = this._getRowMeta(row, critterAliasMap);

      if (!critter_id) {
        rowErrors.push({ row: index, message: 'Unable to find matching Critter with alias.' });
      }

      if (!capture_id) {
        rowErrors.push({ row: index, message: 'Unable to find matching Capture with date and time.' });
      }

      if (!tsn) {
        rowErrors.push({ row: index, message: 'Unable to find ITIS TSN for Critter.' });
      } else {
        for (const column of nonStandardColumns) {
          const cellValue = row[column];

          if (cellValue === undefined) {
            continue;
          }

          const measurements = tsnMeasurementsMap.get(tsn);

          if (!measurements || (!measurements.quantitative.length && !measurements.qualitative.length)) {
            rowErrors.push({ row: index, col: column, message: 'No measurements exist for this taxon.' });
            continue;
          }

          const qualitativeMeasurement = measurements?.qualitative.find(
            (measurement) => measurement.measurement_name.toLowerCase() === column.toLowerCase()
          );

          if (qualitativeMeasurement) {
            const matchingOptionValue = qualitativeMeasurement.options.find(
              (option) => option.option_label.toLowerCase() === cellValue.toLowerCase()
            );

            if (!matchingOptionValue) {
              rowErrors.push({
                row: index,
                col: column,
                message: `Incorrect qualitative measurement value. Allowed: ${qualitativeMeasurement.options.map(
                  (option) => option.option_label.toLowerCase()
                )}`
              });
              continue;
            }
          }

          const quantitativeMeasurement = measurements?.quantitative.find(
            (measurement) => measurement.measurement_name.toLowerCase() === column.toLowerCase()
          );

          if (quantitativeMeasurement) {
            if (typeof cellValue !== 'number') {
              rowErrors.push({ row: index, col: column, message: 'Quantitative measurement expecting number value.' });
            }

            if (quantitativeMeasurement.max_value != null && cellValue > quantitativeMeasurement.max_value) {
              rowErrors.push({
                row: index,
                col: column,
                message: 'Quantitative measurement out of bounds. Too large.'
              });
            }

            if (quantitativeMeasurement.min_value != null && cellValue < quantitativeMeasurement.min_value) {
              rowErrors.push({
                row: index,
                col: column,
                message: 'Quantitative measurement out of bounds. Too small.'
              });
            }

            continue;
          }

          rowErrors.push({
            row: index,
            col: column,
            message: 'Unable to match column name to an existing measurement.'
          });
        }
      }
    });

    if (!rowErrors.length) {
      return { success: true, data: [] };
    }

    return { success: false, error: { issues: rowErrors } };
  }

  /**
   * Insert CSV measurements into Critterbase.
   *
   * @async
   * @param {CsvCritter[]} measurementRows - CSV row measurements
   * @returns {Promise<number[]>} List of inserted measurements
   */
  async insert(measurementRows: CsvMeasurement[]): Promise<number> {
    console.log(measurementRows);
    return 1;
  }
}
