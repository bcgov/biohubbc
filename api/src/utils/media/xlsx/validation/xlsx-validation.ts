import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { CSVWorkBook, WorkBookValidator } from '../../csv/csv-file';


export type ParentChildKeyMatchValidatorConfig = {
  submission_required_files_validator: {
    name?: string;
    description?: string;
    child_worksheet_name: string;
    parent_worksheet_name: string;
    column_names: string[];
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
      column_names
    } = config.submission_required_files_validator

    const parentWorksheet = csvWorkbook.worksheets[parent_worksheet_name]
    const childWorksheet = csvWorkbook.worksheets[child_worksheet_name]

    if (!parentWorksheet || !childWorksheet) {
      return csvWorkbook
    }

    // Encodes the column values for a worksheet at a given row into a string, which is used for
    // comparison with another worksheet
    const serializer = (rowObject: object): string => {
      return column_names
        .map((columnName: string) => (rowObject[columnName] as String).trim())
        .join('|');
    }

    const parentRowObjects = parentWorksheet.getRowObjects()
    const childRowObjects = childWorksheet.getRowObjects()

    const parentSerializedRows = parentRowObjects.map(serializer)

    // Add an error for each cell containing a dangling key reference in the child worksheet
    childRowObjects
      .map(serializer)
      .map((serializedRow: string, rowIndex: number) => {
        return !serializedRow || parentSerializedRows.includes(serializedRow) ? -1 : rowIndex;
      })
      .filter((rowIndex: number) => rowIndex >= 1)
      .forEach((danglingRowIndex: number) => {
        const mismatchedColumn = column_names.find((columnName: string) => {
          return parentRowObjects[danglingRowIndex][columnName] !== childRowObjects[danglingRowIndex][columnName]
        }) || column_names[column_names.length - 1];

        childWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
            message: `Child worksheet references a key that is missing from the corresponding column in the parent worksheet`,
            col: mismatchedColumn,
            row: danglingRowIndex + 2
          }
        ]);
      })

    return csvWorkbook;
  }
}
