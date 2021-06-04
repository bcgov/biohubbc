import { CSVValidator } from './csv-validation';

export const getDuplicateHeadersValidator = (): CSVValidator => {
  return (file) => {
    const headers = file.getHeaders();

    if (!headers?.length) {
      return file;
    }

    const seenHeaders: string[] = [];

    for (const header of headers) {
      if (seenHeaders.includes(header)) {
        file.csvValidation.addHeaderErrors([
          {
            type: 'Invalid',
            code: 'DuplicateHeader',
            message: 'Duplicate header',
            col: header
          }
        ]);
      } else {
        seenHeaders.push(header);
      }
    }

    return file;
  };
};

export const hasRequiredHeadersValidator = (requiredHeaders?: string[]): CSVValidator => {
  return (file) => {
    if (!requiredHeaders?.length) {
      return file;
    }

    const headers = file.getHeaders();

    if (!headers?.length) {
      file.csvValidation.addHeaderErrors(
        requiredHeaders.map((requiredHeader) => {
          return {
            type: 'Missing',
            code: 'MissingRequiredHeader',
            message: 'Missing required header',
            col: requiredHeader
          };
        })
      );

      return file;
    }

    for (const requiredHeader of requiredHeaders) {
      if (!headers.includes(requiredHeader)) {
        file.csvValidation.addHeaderErrors([
          {
            type: 'Missing',
            code: 'MissingRequiredHeader',
            message: 'Missing required header',
            col: requiredHeader
          }
        ]);
      }
    }

    return file;
  };
};

export const getValidHeadersValidator = (validHeaders?: string[]): CSVValidator => {
  return (file) => {
    if (!validHeaders?.length) {
      return file;
    }

    const headers = file.getHeaders();

    for (const header of headers) {
      if (!validHeaders.includes(header)) {
        file.csvValidation.addHeaderErrors([
          {
            type: 'Invalid',
            code: 'UnknownHeader',
            message: 'Unsupported header',
            col: header
          }
        ]);
      }
    }

    return file;
  };
};
