import { expect } from 'chai';
import { describe } from 'mocha';
import xlsx from 'xlsx';
import { CSVWorksheet } from '../csv-file';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRequiredHeadersValidator,
  hasRecommendedHeadersValidator
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
        errorCode: 'Duplicate Header',
        col: 'Header1',
        message: 'Duplicate header'
      },
      {
        errorCode: 'Duplicate Header',
        col: 'Header2',
        message: 'Duplicate header'
      }
    ]);
  });
});

describe('hasRequiredHeadersValidator', () => {
  it('adds no errors when required headers are undefined', () => {
    const requiredHeaders = undefined;

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors when there are no required headers', () => {
    const requiredHeaders = { file_required_columns_validator: { required_columns: [] } };

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for all headers if there are required headers but no header row', () => {
    const requiredHeaders = {
      file_required_columns_validator: { required_columns: ['Header1', 'Header2', 'Header3'] }
    };

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[]]); // empty csv

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        errorCode: 'Missing Required Header',
        col: 'Header1',
        message: 'Missing required header'
      },
      {
        errorCode: 'Missing Required Header',
        col: 'Header2',
        message: 'Missing required header'
      },
      {
        errorCode: 'Missing Required Header',
        col: 'Header3',
        message: 'Missing required header'
      }
    ]);
  });

  it('adds errors for each missing header that is required', () => {
    const requiredHeaders = {
      file_required_columns_validator: { required_columns: ['Header1', 'Header3', 'Header4', 'Header5'] }
    };

    const validator = hasRequiredHeadersValidator(requiredHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        errorCode: 'Missing Required Header',
        col: 'Header3',
        message: 'Missing required header'
      },
      {
        errorCode: 'Missing Required Header',
        col: 'Header5',
        message: 'Missing required header'
      }
    ]);
  });
});

describe('getValidHeadersValidator', () => {
  it('adds no errors when configuration is not found', () => {
    const validHeaders = undefined;

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds no errors when no valid headers provided', () => {
    const validHeaders = { file_valid_columns_validator: { valid_columns: [] } };

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds no errors if there are no invalid headers', () => {
    const validHeaders = { file_valid_columns_validator: { valid_columns: ['Header1', 'Header2', 'Header3'] } };

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for all headers that are not valid ', () => {
    const validHeaders = { file_valid_columns_validator: { valid_columns: ['Header1', 'Header2', 'Header3'] } };

    const validator = getValidHeadersValidator(validHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'UnknownHeader2', 'Header3', 'UnknownHeader4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        errorCode: 'Unknown Header',
        col: 'UnknownHeader2',
        message: 'Unsupported header'
      },
      {
        errorCode: 'Unknown Header',
        col: 'UnknownHeader4',
        message: 'Unsupported header'
      }
    ]);
  });
});

describe('hasRecommendedHeadersValidator', () => {
  it('adds no errors when there are no recommended headers', () => {
    const recommendedHeaders = undefined;

    const validator = hasRecommendedHeadersValidator(recommendedHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.rowErrors).to.eql([]);
  });

  it('adds no errors/warnings when there are no recommended headers', () => {
    const recommendedHeaders = {
      file_recommended_columns_validator: { recommended_columns: [] }
    };

    const validator = hasRecommendedHeadersValidator(recommendedHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([]);
  });

  it('adds errors for each missing header that is recommended', () => {
    const recommendedHeaders = {
      file_recommended_columns_validator: { recommended_columns: ['Header1', 'Header3', 'Header4', 'Header5'] }
    };

    const validator = hasRecommendedHeadersValidator(recommendedHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([['Header1', 'Header2', 'Header4']]);

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        errorCode: 'Missing Recommended Header',
        col: 'Header3',
        message: 'Missing recommended header'
      },
      {
        errorCode: 'Missing Recommended Header',
        col: 'Header5',
        message: 'Missing recommended header'
      }
    ]);
  });

  it('adds warnings for all headers if there are recommended headers but no header row', () => {
    const recommendedHeaders = {
      file_recommended_columns_validator: { recommended_columns: ['Header1', 'Header2', 'Header3'] }
    };

    const validator = hasRecommendedHeadersValidator(recommendedHeaders);

    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([[]]); // empty csv

    const csvWorkSheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    validator(csvWorkSheet);

    expect(csvWorkSheet.csvValidation.headerErrors).to.eql([
      {
        errorCode: 'Missing Recommended Header',
        col: 'Header1',
        message: 'Missing recommended header'
      },
      {
        errorCode: 'Missing Recommended Header',
        col: 'Header2',
        message: 'Missing recommended header'
      },
      {
        errorCode: 'Missing Recommended Header',
        col: 'Header3',
        message: 'Missing recommended header'
      }
    ]);
  });
});
