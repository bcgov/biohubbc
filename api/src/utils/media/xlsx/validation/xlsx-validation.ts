import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { safeTrim } from '../../../string-utils';
import { CSVWorkBook, WorkBookValidator } from '../../csv/csv-file';

export type ParentChildKeyMatchValidatorConfig = {
  workbook_parent_child_key_match_validator: {
    description?: string;
    child_worksheet_name: string;
    parent_worksheet_name: string;
    column_names: string[];
  };
};

/**
 * For a specified parent sheet, child sheet, and set of parent and child columns, adds an error on each cell in the
 * child sheet whose key in the corresponding row belonging to the parent sheet cannot be found.
 *
 * Note: If the cell is empty, this check will be skipped. Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ParentChildKeyMatchValidatorConfig} [config] The validator config
 * @return {*}  {WorkBookValidator} The workbook validator
 *
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
    } = config.workbook_parent_child_key_match_validator;

    const parentWorksheet = csvWorkbook.worksheets[parent_worksheet_name];
    const childWorksheet = csvWorkbook.worksheets[child_worksheet_name];

    if (!parentWorksheet || !childWorksheet) {
      return csvWorkbook;
    }

    const parentRowObjects = parentWorksheet.getRowObjects();
    const childRowObjects = childWorksheet.getRowObjects();

    // If there are no children rows found, leave early
    if (!childRowObjects.length) {
      return csvWorkbook;
    }

    // Filter column names to only check key violation on columns included in the child sheet
    const filteredColumnNames = column_names.filter((columnName) => Boolean(childRowObjects[0][columnName]));

    /**
     * Encodes the column values for a worksheet at a given row into a string, which is used for comparison with another worksheet
     * @param {Record<string, any>} rowObject A record reflecting a row in a tbale
     * @returns {*} {string} The row objected encoded as a string
     */
    const serializer = (rowObject: Record<string, any>): string => {
      return (
        filteredColumnNames
          // Retrieve the value from each column
          .map((columnName: string) => String(rowObject[columnName]))

          // Remove empty column values
          .filter(Boolean)

          // Escape possible column deliminator instances from column value string
          // Trim whitespace
          .map(safeTrim)

          // Deliminate column values
          .join('|')
      );
    };

    const parentSerializedRows = parentRowObjects.map(serializer);

    // Add an error for each cell containing a dangling key reference in the child worksheet
    const danglingRowIndices = childRowObjects
      // Serialize each row in order to match column values
      .map(serializer)

      // Maps a row index to `-1`, if and only if the given row has a matching row in the parent
      .map((serializedRow: string, rowIndex: number) => {
        return !serializedRow || parentSerializedRows.includes(serializedRow) ? -1 : rowIndex;
      })

      // Filter any row indices which have a matching row in the parent
      .filter((rowIndex: number) => rowIndex >= 0)

      // Add +2 to the index to reflect the actual row number in the file
      .map((index: number) => index + 2);

    if (danglingRowIndices.length === 0) {
      return csvWorkbook;
    }

    // For any and all of the remaining 'dangling' row indices, insert a single key error reflecting the missing keys from the parent.
    const columnNameIndexString = `[${column_names.join(', ')}]`;
    childWorksheet.csvValidation.addKeyErrors([
      {
        errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
        message: `${child_worksheet_name}${columnNameIndexString} must have matching value in ${parent_worksheet_name}${columnNameIndexString}.`,
        colNames: column_names,
        rows: danglingRowIndices
      }
    ]);

    return csvWorkbook;
  };
};
