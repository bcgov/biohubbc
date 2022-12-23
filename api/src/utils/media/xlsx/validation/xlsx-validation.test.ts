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
      { column1: 'column1-row1', column2: 'column2-row1', column4: 'A', column5: 'A' },
      { column1: 'column1-row2', column2: 'column2-row2', column4: 'B', column5: 'B' },
      { column1: 'column1-row3', column2: 'column2-row3', column4: 'C', column5: 'C' },
      { column1: 'column1-row4', column2: 'column2-row4', column4: 'D', column5: 'D' }
    ]),
    'parent_sheet'
  );

  // Second sheet
  XLSX.utils.book_append_sheet(
    mockWorkbook,
    XLSX.utils.json_to_sheet([
      { column1: 'column1-row1', column2: 'column2-row1', column3: 'column3-row1', column4: 'A' },
      { column1: 'column1-row2', column2: 'column2-row2', column3: 'column3-row2', column4: 'D' },
      { column1: 'column1-row3', column2: 'column2-row3', column3: 'column3-row3', column4: 'E' }
    ]),
    'child_sheet'
  );

  return new CSVWorkBook(mockWorkbook);
};

describe('getParentChildKeyMatchValidator', async () => {
  it('should not add errors when config is not provided', async () => {
    const validator = getParentChildKeyMatchValidator();
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if no column names provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: []
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if empty child sheet string is provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: '',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if empty parent sheet string is provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: '',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if the provided parent sheet name is not found in the workbook', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'unknown_sheet_name',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if the provided child sheet name is not found in the workbook', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'unknown_sheet_name',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if no dangling indices are found for a single column', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if no dangling indices are found for multiple columns', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1', 'column2']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;

    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should not add errors if parent column happens to contain serialized child column values', async () => {
    const workbook = XLSX.utils.book_new();
    // First sheet
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ column1: 'A|B', column2: '' }]), 'parent_sheet');

    // Second sheet
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ column1: 'A', column2: 'B|' }]), 'child_sheet');

    const mockWorkbook = new CSVWorkBook(workbook);

    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1', 'column2']
      }
    });
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;
    expect(child_sheet.csvValidation.keyErrors).to.eql([
      {
        errorCode: 'Missing Child Key from Parent',
        colNames: ['column1', 'column2'],
        message: 'child_sheet[column1, column2] must have matching value in parent_sheet[column1, column2].',
        rows: [2]
      }
    ]);
  });

  it('should add errors if a column name is absent from the parent sheet but present in the child sheet', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2', 'column3']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;
    expect(child_sheet.csvValidation.keyErrors).to.eql([
      {
        colNames: ['column2', 'column3'],
        errorCode: 'Missing Child Key from Parent',
        message: 'child_sheet[column2, column3] must have matching value in parent_sheet[column2, column3].',
        rows: [2, 3, 4]
      }
    ]);
  });

  it('should not add errors if a column name is absent from the child sheet but present in the parent sheet', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2', 'column5']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;
    expect(child_sheet.csvValidation.keyErrors).to.eql([]);
  });

  it('should only add a given error to the child sheet and not the parent', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column3']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet, parent_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.keyErrors).to.eql([]);
    expect(child_sheet.csvValidation.keyErrors).to.eql([
      {
        colNames: ['column3'],
        errorCode: 'Missing Child Key from Parent',
        message: 'child_sheet[column3] must have matching value in parent_sheet[column3].',
        rows: [2, 3, 4]
      }
    ]);
  });

  it('should only include rows containing a dangling key in the child sheet in key errors', async () => {
    const validator = getParentChildKeyMatchValidator({
      workbook_parent_child_key_match_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column4']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { child_sheet } = mockWorkbook.worksheets;
    expect(child_sheet.csvValidation.keyErrors).to.eql([
      {
        colNames: ['column4'],
        errorCode: 'Missing Child Key from Parent',
        message: 'child_sheet[column4] must have matching value in parent_sheet[column4].',
        rows: [4]
      }
    ]);
  });
});
