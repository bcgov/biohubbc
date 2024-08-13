import { ApiGeneralError } from '../../errors/api-error';
import { MediaFile } from '../../utils/media/media-file';
import { getColumnValidatorSpecification } from '../../utils/xlsx-utils/column-validator-utils';
import {
  constructXLSXWorkbook,
  getDefaultWorksheet,
  getWorksheetRowObjects,
  validateCsvFile
} from '../../utils/xlsx-utils/worksheet-utils';
import { CSVImportStrategy } from './csv-import.interface';

/**
 * Import CSV - Used with `CSVImportStrategy` classes.
 *
 * How to?: Inject a media-file and import strategy that implements `CSVImportStrategy`.
 *
 * Flow:
 *  1. Get the worksheet from the CSV MediaFile - _getWorksheet
 *  2. Validate the standard columns with the `importCsvStrategy` column validator - _validate -> validateCsvFile
 *  3. Validate row data with import strategy - _validate -> importCsvService.validateRows
 *  4. Insert the data into database or send to external system - import -> importCsvStrategy.insert
 *
 * @async
 * @template ValidatedRow - Validated row object
 * @template InsertReturn - Return type of the importer insert method
 * @param {MediaFile} csvMediaFile - CSV converted to MediaFile
 * @param {CSVImportStrategy<ValidatedRow, InsertReturn>} importer - Import strategy
 * @throws {ApiGeneralError} - If validation fails
 * @returns {Promise<ReturnType>} Generic return type
 */
export const importCSV = async <ValidatedRow, InsertReturn>(
  csvMediaFile: MediaFile,
  importer: CSVImportStrategy<ValidatedRow, InsertReturn>
) => {
  const _worksheet = getDefaultWorksheet(constructXLSXWorkbook(csvMediaFile));

  // Optionally pre-parse the worksheet before passing to validator
  // Usefull if needing to mutate incomming worksheet data before validation ie: time columns
  const worksheet = importer.preParseWorksheet ? importer.preParseWorksheet(_worksheet) : _worksheet;

  // Validate the standard columns in the CSV file
  if (!validateCsvFile(worksheet, importer.columnValidator)) {
    throw new ApiGeneralError(`Column validator failed. Column headers or cell data types are incorrect.`, [
      { csv_column_errors: getColumnValidatorSpecification(importer.columnValidator) },
      'importCSV->_validate->validateCsvFile'
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
      'importCSV->_validate->_validateRows'
    ]);
  }

  // Insert the data or send to external systems
  return importer.insert(validation.data);
};
