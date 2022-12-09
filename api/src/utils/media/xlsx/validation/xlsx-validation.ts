import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { CSVWorkBook, WorkBookValidator } from '../../csv/csv-file';


export type ParentChildKeyMatchValidatorConfig = {
  childWorksheetName: string;
  parentWorksheetName: string;
  childColumnNames: string[];
  parentColumnNames: string[];
};

/**
 * @TODO jsdoc
 * @param {KeyMatchValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getParentChildKeyMatchValidator = (config?: ParentChildKeyMatchValidatorConfig): WorkBookValidator => {
  return (csvWorkbook: CSVWorkBook) => {
    if (!config) {
      return csvWorkbook;
    }
    
    const {
      childWorksheetName,
      parentWorksheetName,
      childColumnNames,
      parentColumnNames
    } = config

    // If parent and child column name lengths don't agree, skip validation
    if (parentColumnNames.length != childColumnNames.length) {
      return csvWorkbook
    }

    const parentWorksheet = csvWorkbook.worksheets[parentWorksheetName]
    const childWorksheet = csvWorkbook.worksheets[childWorksheetName]

    if (!parentWorksheet || !childWorksheet) {
      return csvWorkbook
    }

    const parentRows = parentWorksheet.getRowObjects()
    const childRows = childWorksheet.getRowObjects()

    for (let columnIndex of childColumnNames.keys()) {
      const parentColumnName = parentColumnNames[columnIndex]
      const childColumnName = childColumnNames[columnIndex]

      const parentColumnValues: any[] = parentRows.map((rowObject) => rowObject[parentColumnName])
      const childColumnValues: any[] = childRows.map((rowObject) => rowObject[childColumnName])

      // Add an error for each cell containing a dangling key reference in the child worksheet
      childColumnValues
        .map((value: any, rowIndex: number) => {
          return parentColumnValues.includes(value) ? -1 : rowIndex;
        })
        .filter((rowIndex: number) => rowIndex >= 0)
        .forEach((rowIndex: number) => {
          childWorksheet.csvValidation.addRowErrors([
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
              message: `Child worksheet references a key that is missing from the corresponding column in the parent worksheet`,
              col: childColumnName,
              row: rowIndex + 2
            }
          ]);
        })
    }

    return csvWorkbook;
  }
}
