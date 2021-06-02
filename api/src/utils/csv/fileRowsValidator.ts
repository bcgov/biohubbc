import { ParseError } from 'papaparse';

// File rows validation helper functions

export const getRows = (data: string[][]): string[][] => {
  if (!data?.length) {
    return [];
  }

  data.splice(0, 1);

  return data;
};

export const hasRequiredFields = (
  rows: string[][],
  headers: string[],
  requiredFieldsByHeader?: string[]
): ParseError[] => {
  if (!requiredFieldsByHeader?.length) {
    return [];
  }

  if (!rows?.length) {
    return requiredFieldsByHeader.map((requiredFieldByHeader) => {
      return {
        type: 'Missing',
        code: 'MissingRequiredField',
        message: `Missing value for required column: ${requiredFieldByHeader}`,
        row: 2
      };
    });
  }

  const rowErrors: ParseError[] = [];

  rows.forEach((row, rowIndex) => {
    for (const requiredFieldByHeader of requiredFieldsByHeader) {
      const columnIndex = headers.indexOf(requiredFieldByHeader);

      const rowValueForColumn = row[columnIndex];

      if (!rowValueForColumn) {
        rowErrors.push({
          type: 'Missing',
          code: 'MissingRequiredField',
          message: `Missing value for required column: ${requiredFieldByHeader}`,
          row: rowIndex + 2
        });
      }
    }
  });

  return rowErrors;
};
