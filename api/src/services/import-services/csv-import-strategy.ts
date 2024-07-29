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
 * Import CSV (Strategy) - Used with `CSVImportService` classes.
 *
 * How to?: Inject a media-file and import service that implements the CSVImportService.
 *
 * Flow:
 *  1. Get the worksheet from the CSV MediaFile - _getWorksheet
 *  2. Validate the standard columns with the `importCsvService` column validator - _validate -> validateCsvFile
 *  3. Validate row data with import service - _validate -> importCsvService.validateRows
 *  4. Insert the data into database or send to external system - import -> importCsvService.insert
 *
 * @async
 * @template ValidatedRow - Validated row object
 * @template InsertReturn - Return type of the importer insert method
 * @param {MediaFile} csvMediaFile - CSV converted to MediaFile
 * @param {CSVImportService<ValidatedRow, InsertReturn>} importer - Import service
 * @throws {ApiGeneralError} - If validation fails
 * @returns {Promise<ReturnType>} Generic return type
 */
export const importCSV = async <ValidatedRow, InsertReturn>(
  csvMediaFile: MediaFile,
  importer: CSVImportService<ValidatedRow, InsertReturn>
) => {
  const worksheet = getDefaultWorksheet(constructXLSXWorkbook(csvMediaFile));

  // Validate the standard columns in the CSV file
  if (!validateCsvFile(worksheet, importer.columnValidator)) {
    throw new ApiGeneralError(`Column validator failed. Column headers or cell data types are incorrect.`, [
      { csv_column_errors: getColumnValidatorSpecification(importer.columnValidator) },
      'importCapturesService->_validate->validateCsvFile'
    ]);
  }

  // Convert the worksheet into an array of records
  const worksheetRows = getWorksheetRowObjects(worksheet);

  // Validate the CSV rows with reference data
  const validation = await importer.validateRows(worksheetRows, worksheet);

  // Throw error is row validation failed and inject validation errors
  // The validation errors can be either custom (Validation) or Zod (SafeParseReturn)
  if (!validation.success) {
    throw new ApiGeneralError(`Failed to import Critter CSV. Column data validator failed.`, [
      { csv_row_errors: validation.error.issues },
      'importCapturesService->_validate->_validateRows'
    ]);
  }

  // Insert the data or send to external systems
  return importer.insert(validation.data);
};
