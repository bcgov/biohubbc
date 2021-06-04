import { CSVValidator } from './csv-validation';

export const getRequiredFieldsValidator = (requiredFieldsByHeader?: string[]): CSVValidator => {
  return (file) => {
    if (!requiredFieldsByHeader?.length) {
      return file;
    }

    const rows = file.getRows();

    if (!rows?.length) {
      file.csvValidation.addRowErrors(
        requiredFieldsByHeader.map((requiredFieldByHeader) => {
          return {
            type: 'Missing',
            code: 'MissingRequiredField',
            message: `Missing required value for column: ${requiredFieldByHeader}`,
            row: 2
          };
        })
      );

      return file;
    }

    const headers = file.getHeaders();

    rows.forEach((row, rowIndex) => {
      for (const requiredFieldByHeader of requiredFieldsByHeader) {
        const columnIndex = headers.indexOf(requiredFieldByHeader);

        const rowValueForColumn = row[columnIndex];

        if (!rowValueForColumn) {
          file.csvValidation.addRowErrors([
            {
              type: 'Missing',
              code: 'MissingRequiredField',
              message: `Missing required value for column: ${requiredFieldByHeader}`,
              row: rowIndex + 2
            }
          ]);
        }
      }
    });

    return file;
  };
};
