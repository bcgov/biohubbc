import { CSVValidator } from '../csv-file';

/**
 * Adds an error for each header that is not unique.
 *
 * @return {*}  {CSVValidator}
 */
export const getDuplicateHeadersValidator = (): CSVValidator => {
  return (csvWorksheet) => {
    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      return csvWorksheet;
    }

    const seenHeaders: string[] = [];

    for (const header of headers) {
      if (seenHeaders.includes(header)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            code: 'DuplicateHeader',
            message: 'Duplicate header',
            col: header
          }
        ]);
      } else {
        seenHeaders.push(header);
      }
    }

    return csvWorksheet;
  };
};

/**
 * For each `requiredHeaders`, adds an error if the header is not present in the csv.
 *
 * @param {string[]} [requiredHeaders]
 * @return {*}  {CSVValidator}
 */
export const hasRequiredHeadersValidator = (requiredHeaders?: string[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!requiredHeaders?.length) {
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      csvWorksheet.csvValidation.addHeaderErrors(
        requiredHeaders.map((requiredHeader) => {
          return {
            type: 'Missing',
            code: 'MissingRequiredHeader',
            message: 'Missing required header',
            col: requiredHeader
          };
        })
      );

      return csvWorksheet;
    }

    for (const requiredHeader of requiredHeaders) {
      if (!headers.includes(requiredHeader)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            code: 'MissingRequiredHeader',
            message: 'Missing required header',
            col: requiredHeader
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};

/**
 * Adds an error for any header that is not found in the provided `validHeaders` array.
 *
 * @param {string[]} [validHeaders]
 * @return {*}  {CSVValidator}
 */
export const getValidHeadersValidator = (validHeaders?: string[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!validHeaders?.length) {
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    for (const header of headers) {
      if (!validHeaders.includes(header)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            code: 'UnknownHeader',
            message: 'Unsupported header',
            col: header
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};
