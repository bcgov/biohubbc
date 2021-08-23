import xlsx from 'xlsx';
import { expect } from 'chai';
import { describe } from 'mocha';
import { CSVWorksheet } from '../csv-file';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRequiredHeadersValidator
} from './csv-header-validator';

describe('getDuplicateHeadersValidator', () => {
  it('adds no errors when there are no headers', () => {
    const validator = getDuplicateHeadersValidator();

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[]]); // empty csv

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds no errors if no headers are duplicates', () => {
    const validator = getDuplicateHeadersValidator();

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header3']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for each header that is a duplicate', () => {
    const validator = getDuplicateHeadersValidator();

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header1', 'Header3', 'Header2', 'Header4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        code: 'DuplicateHeader',
        col: 'Header1',
        message: 'Duplicate header'
      },
      {
        code: 'DuplicateHeader',
        col: 'Header2',
        message: 'Duplicate header'
      }
    ]);
  });
});

describe('hasRequiredHeadersValidator', () => {
  it('adds no errors when there are no required headers', () => {
    const requiredHeaders: string[] = [];

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for all headers if there are required headers but no header row', () => {
    const requiredHeaders: string[] = ['Header1', 'Header2', 'Header3'];

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[]]); // empty csv

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        code: 'MissingRequiredHeader',
        col: 'Header1',
        message: 'Missing required header',
        type: 'Missing'
      },
      {
        code: 'MissingRequiredHeader',
        col: 'Header2',
        message: 'Missing required header',
        type: 'Missing'
      },
      {
        code: 'MissingRequiredHeader',
        col: 'Header3',
        message: 'Missing required header',
        type: 'Missing'
      }
    ]);
  });

  it('adds errors for each missing header that is required', () => {
    const requiredHeaders: string[] = ['Header1', 'Header3', 'Header4', 'Header5'];

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        code: 'MissingRequiredHeader',
        col: 'Header3',
        message: 'Missing required header',
        type: 'Missing'
      },
      {
        code: 'MissingRequiredHeader',
        col: 'Header5',
        message: 'Missing required header',
        type: 'Missing'
      }
    ]);
  });
});

describe('getValidHeadersValidator', () => {
  it('adds no errors when no valid headers provided', () => {
    const validHeaders: string[] = [];

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds no errors if there are no invalid headers', () => {
    const validHeaders: string[] = ['Header1', 'Header2', 'Header3'];

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for all headers that are not valid ', () => {
    const validHeaders: string[] = ['Header1', 'Header2', 'Header3'];

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'UnknownHeader2', 'Header3', 'UnknownHeader4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        code: 'UnknownHeader',
        col: 'UnknownHeader2',
        message: 'Unsupported header'
      },
      {
        code: 'UnknownHeader',
        col: 'UnknownHeader4',
        message: 'Unsupported header'
      }
    ]);
  });
});
