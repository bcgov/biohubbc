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

export class CSVImportStrategy<ValidatedRow, PartialRow = Partial<ValidatedRow>> {
  importCsvService: CSVImportService<ValidatedRow, PartialRow>;

  _rows?: PartialRow[];

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
   * Get the marking rows from the xlsx worksheet.
   *
   * @param {WorkSheet} worksheet
   */
  _getRows(worksheet: WorkSheet) {
    // Attempt to retrieve from rows property to prevent unnecessary parsing
    if (this._rows) {
      return this._rows;
    }

    // Convert the worksheet into an array of records
    const worksheetRows = getWorksheetRowObjects(worksheet);

    // Pre parse the records into partial marking rows
    this._rows = this.importCsvService.getRowsToValidate(worksheetRows, worksheet);

    return this._rows;
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

    const rowsToValidate = this._getRows(worksheet);

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
   * Import the CSV file
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

    return this.importCsvService.insert<T>(parsedData);
  }
}
