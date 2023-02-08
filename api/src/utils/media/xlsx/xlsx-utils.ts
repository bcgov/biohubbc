import xlsx, { CellObject } from 'xlsx';
import { safeTrim } from '../../string-utils';

/**
 * Get a worksheet by name.
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @param {string} sheetName
 * @return {*}  {xlsx.WorkSheet}
 */
export function getWorksheetByName(workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet {
  return workbook.Sheets[sheetName];
}

/**
 * Get a worksheets decoded range object, or return undefined if the worksheet is missing range information.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {(xlsx.Range | undefined)}
 */
export function getWorksheetRange(worksheet: xlsx.WorkSheet): xlsx.Range | undefined {
  const ref = worksheet['!ref'];

  if (!ref) {
    return undefined;
  }

  return xlsx.utils.decode_range(ref);
}

/**
 * Iterates over the cells in the worksheet and:
 * - Trims whitespace from cell values.
 * - Converts `Date` objects to ISO strings.
 *
 * https://stackoverflow.com/questions/61789174/how-can-i-remove-all-the-spaces-in-the-cells-of-excelsheet-using-nodejs-code
 * @param worksheet
 */
export function prepareWorksheetCells(worksheet: xlsx.WorkSheet) {
  const range = getWorksheetRange(worksheet);

  if (!range) {
    return undefined;
  }

  for (let r = range.s.r; r < range.e.r; r++) {
    for (let c = range.s.c; c < range.e.c; c++) {
      const coord = xlsx.utils.encode_cell({ r, c });
      let cell: CellObject = worksheet[coord];

      if (!cell || !cell.v) {
        continue;
      }

      cell = replaceCellDates(cell);

      cell = trimCellWhitespace(cell);
    }
  }
}

export function trimCellWhitespace(cell: CellObject) {
  // check and clean raw strings
  if (cell.t === 's') {
    cell.v = safeTrim(cell.v);
  }

  // check and clean formatted strings
  if (cell.w) {
    cell.w = safeTrim(cell.w);
  }

  return cell;
}

export function replaceCellDates(cell: CellObject) {
  if (cell.t === 'd' && cell.v instanceof Date) {
    cell.v = (cell.v as Date).toISOString();
  }

  return cell;
}

export function getCellValue(cell: CellObject) {
  // See https://www.npmjs.com/package/xlsx#cell-object for details on cell fields
  return cell.v;
}
