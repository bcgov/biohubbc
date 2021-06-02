import { CsvValidationError, IHeaderRules } from './csv-validator';
import { getRows, hasRequiredFields } from './fileRowsValidator';
import { getDuplicateHeaders, getHeaderRow, hasRequiredHeaders, hasValidHeaders } from './fileHeaderValidator';
import { getFileContent, isCSVNull, isFileMimeValid, isFileNull } from './fileTypeAndContentValidator';

/*
  Function to validate file type and content
*/
export function validateFileTypeAndContent(file: Express.Multer.File, csvValidationError: CsvValidationError) {
  if (isFileNull(file)) {
    csvValidationError.setFileErrors(['File is null']);
    return csvValidationError.getState();
  }

  if (
    !isFileMimeValid(file, [
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ])
  ) {
    csvValidationError.setFileErrors(['File mime type is invalid, must be `.txt`, `.csv`, `.xls`, or `.xlsx']);
    return csvValidationError.getState();
  }

  const fileContent = getFileContent(file, { skipEmptyLines: true });

  if (!fileContent) {
    csvValidationError.setFileErrors(['File is empty']);
    return csvValidationError.getState();
  }

  if (fileContent.errors.length) {
    csvValidationError.setFileErrors(['Failed to parse csv']);
    csvValidationError.setRowErrors(fileContent.errors);
    return csvValidationError.getState();
  }

  if (isCSVNull(fileContent.data)) {
    csvValidationError.setFileErrors(['File is empty']);
    return csvValidationError.getState();
  }
}

/*
  Function to validate file headers
*/
export function validateFileHeaders(
  file: Express.Multer.File,
  csvValidationError: CsvValidationError,
  headerRules?: IHeaderRules
) {
  const fileContent = getFileContent(file, { skipEmptyLines: true });
  const headers = getHeaderRow(fileContent.data);

  const duplicateHeaderErrors = getDuplicateHeaders(headers);

  if (duplicateHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse csv']);
    csvValidationError.addHeaderErrors(duplicateHeaderErrors);
  }

  const requriedHeaderErrors = hasRequiredHeaders(headers, headerRules?.requiredHeaders);

  if (requriedHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse csv']);
    csvValidationError.addHeaderErrors(requriedHeaderErrors);
  }

  const validHeaderErrors = hasValidHeaders(headers, headerRules?.validHeaders);

  if (validHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse csv']);
    csvValidationError.addHeaderErrors(validHeaderErrors);
  }
}

/*
  Function to validate file rows
*/
export function validateFileRows(
  file: Express.Multer.File,
  csvValidationError: CsvValidationError,
  headerRules?: IHeaderRules
) {
  const fileContent = getFileContent(file, { skipEmptyLines: true });
  const headers = getHeaderRow(fileContent.data);
  const rows = getRows(fileContent.data);

  const requiredFieldErrors = hasRequiredFields(rows, headers, headerRules?.requiredFieldsByHeader);

  if (requiredFieldErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse csv']);
    csvValidationError.addRowErrors(requiredFieldErrors);
  }
}
