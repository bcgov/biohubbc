import { WorkSheet } from 'xlsx';
import { ApiGeneralError } from '../../errors/api-error';
import { MediaFile } from '../../utils/media/media-file';
import { getColumnValidatorSpecification } from '../../utils/xlsx-utils/column-cell-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../../utils/xlsx-utils/worksheet-utils';
import { CSVImportService } from './import-types';

/**
 * CSV Import Strategy - Used with `CSVImportService` classes.
 *
 * Why does this exist? The import CSV classes (ie: ImportCrittersService) all follow a similar pattern.
 * This class reduces the need to duplicate code for all CSV import classes.
 *
 * Flow:
 *  1. Get the worksheet from the CSV MediaFile - _getWorksheet
 *  2. Validate the standard columns with the `importCsvService` column validator - _validate -> validateCsvFile
 *  3. Get the rows to validate and format to a useable format - _validate -> importCsvService.getRowsToValidate
 *  4. Retrieve reference data and validate the row data - _validate -> importCsvService.validateRows
 *  5. Insert the data into database or send to external system - import -> importCsvService.insert
 *
 *
 * @class CSVImportStrategy
 * @template ValidatedRow - Validated row object
 * @template PartialRow - Invalidated row object - ie: partial (undefined properties) row object
 */
export class CSVImportStrategy<ValidatedRow, PartialRow = Partial<ValidatedRow>> {
  importCsvService: CSVImportService<ValidatedRow, PartialRow>;

  constructor(importCsvService: CSVImportService<ValidatedRow, PartialRow>) {
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
        { column_specification: getColumnValidatorSpecification(this.importCsvService.columnValidator) },
        'importCapturesService->_validate->validateCsvFile'
      ]);
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Pre parse the records into partial marking rows
    const rowsToValidate = this.importCsvService.getRowsToValidate(worksheetRows, worksheet);

    // Validate the CSV rows with reference data
    const validation = await this.importCsvService.validateRows(rowsToValidate, worksheet);

    // Throw error is row validation failed and inject validation errors
    if (!validation.success) {
      throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, [
        { column_validation: validation.error.issues },
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
