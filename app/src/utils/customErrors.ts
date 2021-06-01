export const getDwcFileValidationError = (errorObj: any): string[] => {
  console.log(errorObj);

  const fileError = errorObj.fileErrors[0] + '.';
  const headerErrors = errorObj.headerErrors.map((headerError: any) => {
    return `Column ${headerError.col}: ${headerError.message}.`;
  });

  const seenRowErrors: string[] = [];
  const rowErrors = errorObj.rowErrors.map((rowError: any) => {
    if (!seenRowErrors.includes(rowError.type)) {
      seenRowErrors.push(rowError.type);

      return rowError.message + '.';
    }
  });

  return [fileError, ...headerErrors, ...rowErrors];
};
