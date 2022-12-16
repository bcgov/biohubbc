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
      { column1: 'column1-row4', column2: 'column2-row4', column4: 'D', column5: 'D' },
    ]),
    'parent_sheet'
  );

  // Second sheet
  XLSX.utils.book_append_sheet(
    mockWorkbook,
    XLSX.utils.json_to_sheet([
      { column1: 'column1-row1', column2: 'column2-row1', column3: 'column3-row1', column4: 'A' },
      { column1: 'column1-row2', column2: 'column2-row2', column3: 'column3-row2', column4: 'D' },
      { column1: 'column1-row3', column2: 'column2-row3', column3: 'column3-row3', column4: 'E' },
    ]),
    'child_sheet'
  );

  return new CSVWorkBook(mockWorkbook);
};

describe.only('getParentChildKeyMatchValidator', async () => {
  it('should add no errors when config is not provided', async () => {
    const validator = getParentChildKeyMatchValidator();
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if no column names provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: []
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if empty child sheet string is provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: '',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if empty parent sheet string is provided', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: '',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if the provided parent sheet name is not found in the workbook', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'unknown_sheet_name',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if the provided child sheet name is not found in the workbook', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'unknown_sheet_name',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if no dangling indices are found for a single column', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add no errors if no dangling indices are found for multiple columns', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column1', 'column2']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should not add errors if parent column happens to contain serialized child column values', async () => {

    const workbook = XLSX.utils.book_new();
    // First sheet
    XLSX.utils.book_append_sheet(
      mockWorkbook,
      XLSX.utils.json_to_sheet([
        { column1: 'column1-row1', column2: 'column2-row1', column4: 'A', column5: 'A' },
        { column1: 'column1-row2', column2: 'column2-row2', column4: 'B', column5: 'B' },
        { column1: 'column1-row3', column2: 'column2-row3', column4: 'C', column5: 'C' },
        { column1: 'column1-row4', column2: 'column2-row4', column4: 'D', column5: 'D' },
      ]),
      'parent_sheet'
    );

    // Second sheet
    XLSX.utils.book_append_sheet(
      mockWorkbook,
      XLSX.utils.json_to_sheet([
        { column1: 'column1-row1', column2: 'column2-row1', column3: 'column3-row1', column4: 'A' },
        { column1: 'column1-row2', column2: 'column2-row2', column3: 'column3-row2', column4: 'D' },
        { column1: 'column1-row3', column2: 'column2-row3', column3: 'column3-row3', column4: 'E' },
      ]),
      'child_sheet'
    );

    return new CSVWorkBook(mockWorkbook);




    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2', 'column3']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    // TODO
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add errors if a column name is absent from the parent sheet', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2', 'column3']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    // TODO
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

  it('should add errors if a column name is absent from the child sheet', async () => {
    const validator = getParentChildKeyMatchValidator({
      submission_required_files_validator: {
        child_worksheet_name: 'child_sheet',
        parent_worksheet_name: 'parent_sheet',
        column_names: ['column2', 'column5']
      }
    });
    const mockWorkbook = makeMockWorkbook();
    validator(mockWorkbook);

    const { parent_sheet, child_sheet } = mockWorkbook.worksheets;
    // TODO
    expect(parent_sheet.csvValidation.rowErrors).to.eql([]);
    expect(child_sheet.csvValidation.rowErrors).to.eql([]);
  });

});
