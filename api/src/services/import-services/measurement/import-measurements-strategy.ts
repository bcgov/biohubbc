import { uniq } from 'lodash';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';
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
import {
  CsvMeasurement,
  CsvQualitativeMeasurement,
  CsvQuantitativeMeasurement
} from './import-measurements-strategy.interface';

const defaultLog = getLogger('services/import/import-measurements-strategy');

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

  /**
   * Get TSN measurement map for validation.
   *
   * For a list of TSNS return all measurements inherited or directly assigned.
   *
   * @async
   * @param {string[]} tsns - List of ITIS TSN's
   * @returns {*}
   */
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

  /**
   * Get row meta data for validation.
   *
   * @param {Row} row - CSV row
   * @param {Map<string, ICritterDetailed | undefined>} critterAliasMap - Survey critter alias mapping
   * @returns {{ capture_id?: string; critter_id?: string; tsn?: string }}
   */
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
   * Validate qualitative measurement.
   *
   * @param {string} cell - CSV measurement cell value
   * @param {CBQualitativeMeasurementTypeDefinition} measurement - Found qualitative measurement match
   * @returns {*}
   */
  _validateQualitativeMeasurementCell(cell: string, measurement: CBQualitativeMeasurementTypeDefinition) {
    if (typeof cell !== 'string') {
      return { error: 'Qualitative measurement expecting text value.', optionId: undefined };
    }

    const matchingOptionValue = measurement.options.find(
      (option) => option.option_label.toLowerCase() === cell.toLowerCase()
    );

    // Validate cell value is an alowed qualitative measurement option
    if (!matchingOptionValue) {
      return {
        error: `Incorrect qualitative measurement value. Allowed: ${measurement.options.map((option) =>
          option.option_label.toLowerCase()
        )}`,
        optionId: undefined
      };
    }

    return { error: undefined, optionId: matchingOptionValue.qualitative_option_id };
  }

  /**
   * Validate quantitative measurement
   *
   * @param {number} cell - CSV measurement cell value
   * @param {CBQuantitativeMeasurementTypeDefinition} measurement - Found quantitative measurement match
   * @returns {*}
   */
  _validateQuantitativeMeasurementCell(cell: number, measurement: CBQuantitativeMeasurementTypeDefinition) {
    if (typeof cell !== 'number') {
      return { error: 'Quantitative measurement expecting number value.', value: undefined };
    }

    // Validate cell value is withing the measurement min max bounds
    if (measurement.max_value != null && cell > measurement.max_value) {
      return { error: 'Quantitative measurement out of bounds. Too small.', value: undefined };
    }

    if (measurement.min_value != null && cell < measurement.min_value) {
      return { error: 'Quantitative measurement out of bounds. Too small.' };
    }

    return { error: undefined, value: cell };
  }

  /**
   * Validate CSV worksheet rows against reference data.
   *
   * Note: This function is longer than I would like, but moving logic into seperate methods
   * made the flow more complex and equally as long.
   *
   * @async
   * @param {Row[]} rows - Invalidated CSV rows
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {*}
   */
  async validateRows(rows: Row[], worksheet: WorkSheet): Promise<Validation<any>> {
    // Generate type-safe cell getter from column validator
    const nonStandardColumns = this._getNonStandardColumns(worksheet);

    // Get Critterbase reference data
    const critterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const rowTsns = rows.map((row) => this._getRowMeta(row, critterAliasMap).tsn).filter(Boolean) as string[];
    const tsnMeasurementsMap = await this._getTsnsMeasurementMap(rowTsns);

    const rowErrors: ValidationError[] = [];
    const validatedRows: CsvMeasurement[] = [];

    rows.forEach((row, index) => {
      const { critter_id, capture_id, tsn } = this._getRowMeta(row, critterAliasMap);

      // Validate critter can be matched via alias
      if (!critter_id) {
        rowErrors.push({ row: index, message: 'Unable to find matching Critter with alias.' });
        return;
      }

      // Validate capture can be matched with date and time
      if (!capture_id) {
        rowErrors.push({ row: index, message: 'Unable to find matching Capture with date and time.' });
        return;
      }

      // This will only be triggered with an invalid alias
      if (!tsn) {
        rowErrors.push({ row: index, message: 'Unable to find ITIS TSN for Critter.' });
        return;
      }

      // Loop through all non-standard (measurement) columns
      for (const column of nonStandardColumns) {
        // Get the cell value from the row (case insensitive)
        const cellValue = row[column] ?? row[column.toLowerCase()] ?? row[column.toUpperCase()];

        // If the cell value is null or undefined - skip validation
        if (cellValue == null) {
          continue;
        }

        const measurements = tsnMeasurementsMap.get(tsn);

        // Validate taxon has reference measurements in Critterbase
        if (!measurements || (!measurements.quantitative.length && !measurements.qualitative.length)) {
          rowErrors.push({ row: index, col: column, message: 'No measurements exist for this taxon.' });
          continue;
        }

        const qualitativeMeasurement = measurements?.qualitative.find(
          (measurement) => measurement.measurement_name.toLowerCase() === column.toLowerCase()
        );

        // QUALITATIVE MEASUREMENT VALIDATION
        if (qualitativeMeasurement) {
          const { error, optionId } = this._validateQualitativeMeasurementCell(cellValue, qualitativeMeasurement);

          if (error !== undefined) {
            rowErrors.push({ row: index, col: column, message: error });
          } else {
            // Assign qualitative measurement to validated rows
            validatedRows.push({
              critter_id,
              capture_id,
              taxon_measurement_id: qualitativeMeasurement.taxon_measurement_id,
              qualitative_option_id: optionId
            });
          }

          continue;
        }

        const quantitativeMeasurement = measurements?.quantitative.find(
          (measurement) => measurement.measurement_name.toLowerCase() === column.toLowerCase()
        );

        // QUANTITATIVE MEASUREMENT VALIDATION
        if (quantitativeMeasurement) {
          const { error, value } = this._validateQuantitativeMeasurementCell(cellValue, quantitativeMeasurement);

          if (error !== undefined) {
            rowErrors.push({ row: index, col: column, message: error });
          } else {
            // Assign quantitative measurement to validated rows
            validatedRows.push({
              critter_id,
              capture_id,
              taxon_measurement_id: quantitativeMeasurement.taxon_measurement_id,
              value: value
            });
          }

          continue;
        }
        console.log('here1');

        // Validate the column header is a known Critterbase measurement
        rowErrors.push({
          row: index,
          col: column,
          message: 'Unable to match column name to an existing measurement.'
        });
      }
    });

    if (!rowErrors.length) {
      return { success: true, data: validatedRows };
    }

    return { success: false, error: { issues: rowErrors } };
  }

  /**
   * Insert CSV measurements into Critterbase.
   *
   * @async
   * @param {CsvCritter[]} measurements - CSV row measurements
   * @returns {Promise<number[]>} List of inserted measurements
   */
  async insert(measurements: CsvMeasurement[]): Promise<number> {
    const qualitative_measurements = measurements.filter(
      (measurement): measurement is CsvQualitativeMeasurement => 'qualitative_option_id' in measurement
    );

    const quantitative_measurements = measurements.filter(
      (measurement): measurement is CsvQuantitativeMeasurement => 'value' in measurement
    );

    const response = await this.surveyCritterService.critterbaseService.bulkCreate({
      qualitative_measurements,
      quantitative_measurements
    });

    const measurementCount = response.created.qualitative_measurements + response.created.quantitative_measurements;

    defaultLog.debug({ label: 'import measurements', measurements, insertedCount: measurementCount });

    return measurementCount;
  }
}
