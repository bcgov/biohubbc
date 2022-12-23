import xlsx from 'xlsx';

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
 * Trims whitespace out of raw value of string cells
 * https://stackoverflow.com/questions/61789174/how-can-i-remove-all-the-spaces-in-the-cells-of-excelsheet-using-nodejs-code
 * @param worksheet
 */
export function trimWorksheetCells(worksheet: xlsx.WorkSheet) {
  const ref = worksheet['!ref'];
  if (!ref) {
    return undefined;
  }

  const range = xlsx.utils.decode_range(ref);
  for (let r = range.s.r; r < range.e.r; r++) {
    for (let c = range.s.c; c < range.e.c; c++) {
      const coord = xlsx.utils.encode_cell({ r, c });
      const cell = worksheet[coord];
      if (!cell || !cell.v) continue;
      // check and clean raw string value
      if (cell.t == 's') {
        cell.v = cell.v.trim();
      }

      // check and clean formatted text
      if (cell.w) {
        cell.w = cell.w.trim();
      }
    }
  }
}
