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
            errorCode: 'Duplicate Header',
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
            errorCode: 'Missing Required Header',
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
            errorCode: 'Missing Required Header',
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
 * For each `recommendedHeaders`, adds an error if the header is not present in the csv.
 *
 * @param {string[]} [recommendedHeaders]
 * @return {*}  {CSVValidator}
 */
export const hasRecommendedHeadersValidator = (recommendedHeaders?: string[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!recommendedHeaders?.length) {
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      csvWorksheet.csvValidation.addHeaderErrors(
        recommendedHeaders.map((recommendedHeader) => {
          return {
            errorCode: 'Missing Recommended Header',
            message: 'Missing recommended header',
            col: recommendedHeader
          };
        })
      );

      return csvWorksheet;
    }

    for (const recommendedHeader of recommendedHeaders) {
      if (!headers.includes(recommendedHeader)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            errorCode: 'Missing Recommended Header',
            message: 'Missing recommended header',
            col: recommendedHeader
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
            errorCode: 'Unknown Header',
            message: 'Unsupported header',
            col: header
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};
