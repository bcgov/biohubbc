import xlsx from 'xlsx';
import { DEFAULT_XLSX_SHEET_NAME } from '../utils/xlsx-utils/worksheet-utils';

/**
 * Returns a mock XLSX workbook buffer.
 *
 * Note: The keys of the record will be used as the worksheet headers.
 *
 * @param {Record<string, any>[]} data The data to inject into the workbook.
 * @return {*} {Buffer}
 */
export const getMockXLSXWorkbookBuffer = (data: Record<string, any>[]): Buffer => {
  // Create a new empty workbook
  const workbook = xlsx.utils.book_new();

  // Create a new worksheet with the array of records
  const worksheet = xlsx.utils.json_to_sheet(data);

  // Inject the worksheet data into the workbook with the default name
  xlsx.utils.book_append_sheet(workbook, worksheet, DEFAULT_XLSX_SHEET_NAME);

  // Convert the workbook to a xlsx buffer
  return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};
