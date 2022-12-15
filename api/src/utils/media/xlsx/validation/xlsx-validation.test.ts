import { expect } from 'chai';
import { describe } from 'mocha';
import XLSX from 'xlsx';
import { CSVWorkBook } from '../../csv/csv-file';
import { getParentChildKeyMatchValidator } from './xlsx-validation';

const makeMockWorkbook = () => {
  const mockWorkbook = XLSX.utils.book_new();
  // First sheet
  XLSX.utils.book_append_sheet(
    mockWorkbook,
    XLSX.utils.json_to_sheet([
      { column1: 'column1-row1', column2: 'column2-row1' },
      { column1: 'column1-row2', column2: 'column2-row2' }
    ]),
    'sheet1'
  );

  // Second sheet
  XLSX.utils.book_append_sheet(
    mockWorkbook,
    XLSX.utils.json_to_sheet([
      { column1: 'column1-row1', column2: 'column2-row1', column3: 'column3-row1' },
      { column1: 'column1-row2', column2: 'column2-row2', column3: 'column3-row2' }
    ]),
    'sheet2'
  );

  return new CSVWorkBook(mockWorkbook);
}

describe.only('getParentChildKeyMatchValidator', async () => {
  it('should add no errors when config is not provided', async () => {
      const validator = getParentChildKeyMatchValidator();
      const mockWorkbook = makeMockWorkbook();
      validator(mockWorkbook);

      const { sheet1, sheet2 } = mockWorkbook.worksheets
      expect(sheet1.csvValidation.rowErrors).to.eql([]);
      expect(sheet2.csvValidation.rowErrors).to.eql([]);
  });
});
