import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { CSVWorkBook, WorkBookValidator } from '../../csv/csv-file';


export type ParentChildKeyMatchValidatorConfig = {
  submission_required_files_validator: {
    name?: string;
    description?: string;
    child_worksheet_name: string;
    parent_worksheet_name: string;
    child_column_names: string[];
    parent_column_names: string[];
  }
};

/**
 * For a specified parent sheet, child sheet, and set of parent and child columns, adds an error on each cell in the
 * child sheet whose key in the corresponding row belonging to the parent sheet cannot be found.
 * 
 * Note: If the cell is empty, this check will be skipped. Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {KeyMatchValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getParentChildKeyMatchValidator = (config?: ParentChildKeyMatchValidatorConfig): WorkBookValidator => {
  return (csvWorkbook: CSVWorkBook) => {
    if (!config) {
      return csvWorkbook;
    }
    
    const {
      child_worksheet_name,
      parent_worksheet_name,
      child_column_names,
      parent_column_names
    } = config.submission_required_files_validator

    // If parent and child column name lengths don't agree, skip validation
    if (parent_column_names.length != child_column_names.length) {
      return csvWorkbook
    }

    const parentWorksheet = csvWorkbook.worksheets[parent_worksheet_name]
    const childWorksheet = csvWorkbook.worksheets[child_worksheet_name]

    if (!parentWorksheet || !childWorksheet) {
      return csvWorkbook
    }

    const parentRows = parentWorksheet.getRowObjects()
    const childRows = childWorksheet.getRowObjects()

    /**
     * @TODO should we zip the column names and use a .every?
     */    
    for (let columnIndex of child_column_names.keys()) {
      const parentColumnName = parent_column_names[columnIndex]
      const childColumnName = child_column_names[columnIndex]

      const parentColumnValues: any[] = parentRows.map((rowObject) => rowObject[parentColumnName])
      const childColumnValues: any[] = childRows.map((rowObject) => rowObject[childColumnName])

      // Add an error for each cell containing a dangling key reference in the child worksheet
      childColumnValues
        .map((value: any, rowIndex: number) => {
          return !value || parentColumnValues.includes(value) ? -1 : rowIndex;
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
