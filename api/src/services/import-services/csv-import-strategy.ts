import { WorkSheet } from 'xlsx';
import { ApiGeneralError } from '../../errors/api-error';
import { MediaFile } from '../../utils/media/media-file';
import { getColumnValidatorSpecification } from '../../utils/xlsx-utils/column-validator-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../../utils/xlsx-utils/worksheet-utils';
import { CSVImportService } from './csv-import-strategy.interface';

/**
 * CSV Import Strategy - Used with `CSVImportService` classes.
 *
 * How to?: Inject a class that implements the CSVImportService and this service will execute
 * the validation for columns / rows and import the data.
 *
 * Flow:
 *  1. Get the worksheet from the CSV MediaFile - _getWorksheet
 *  2. Validate the standard columns with the `importCsvService` column validator - _validate -> validateCsvFile
 *  3. Retrieve reference data and validate the row data - _validate -> importCsvService.validateRows
 *  4. Insert the data into database or send to external system - import -> importCsvService.insert
 *
 *
 * @class CSVImportStrategy
 * @template ValidatedRow - Validated row object
 * @template PartialRow - Invalidated row object - ie: partial (undefined properties) row object
 */
export class CSVImportStrategy<ValidatedRow> {
  importCsvService: CSVImportService<ValidatedRow>;

  constructor(importCsvService: CSVImportService<ValidatedRow>) {
    this.importCsvService = importCsvService;
  }

  /**
   * Get the worksheet from the CSV file.
   *
   * @param {MediaFile} markingCsv - CSV MediaFile
   * @returns {WorkSheet} Xlsx worksheet
   */
  _getWorksheet(markingCsv: MediaFile): WorkSheet {
    return getDefaultWorksheet(constructXLSXWorkbook(markingCsv));
  }

  /**
   * Validate the worksheet contains no errors within the data or structure of CSV.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @throws {ApiGeneralError} - If validation fails
   * @returns {CsvCapture[]} Validated CSV rows
   */
  async _validate(worksheet: WorkSheet): Promise<ValidatedRow[]> {
    // Validate the standard columns in the CSV file
    if (!validateCsvFile(worksheet, this.importCsvService.columnValidator)) {
      throw new ApiGeneralError(`Column validator failed. Column headers or cell data types are incorrect.`, [
        { csv_column_errors: getColumnValidatorSpecification(this.importCsvService.columnValidator) },
        'importCapturesService->_validate->validateCsvFile'
      ]);
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Validate the CSV rows with reference data
    const validation = await this.importCsvService.validateRows(worksheetRows, worksheet);

    // Throw error is row validation failed and inject validation errors
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, [
        { csv_row_errors: validation.error.issues },
        'importCapturesService->_validate->_validateRows'
      ]);
    }

    return validation.data;
  }

  /**
   * Import the CSV file with `importCsvService` child dependency
   *
   * @async
   * @template T - Return type of insert method
   * @param {MediaFile} csvFile - File to import
   * @returns {Promise<T>} Insert return type
   */
  async import<T>(csvFile: MediaFile): Promise<T> {
    // Get the worksheet from the CSV
    const worksheet = this._getWorksheet(csvFile);

    // Validate the standard columns and the data of the CSV
    const parsedData = await this._validate(worksheet);

    // Insert the data into database or send to external systems
    return this.importCsvService.insert(parsedData) as Promise<T>;
  }
}
