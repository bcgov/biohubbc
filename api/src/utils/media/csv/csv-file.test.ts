import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import { CSVValidation, CSVWorkBook, CSVWorksheet, IHeaderError, IRowError } from './csv-file';

describe('CSVWorkBook', () => {
  it('constructs with no rawWorkbook param', () => {
    const csvWorkBook = new CSVWorkBook();

    expect(csvWorkBook).not.to.be.null;
    expect(csvWorkBook.rawWorkbook).not.to.be.null;
    expect(csvWorkBook.worksheets).to.eql({});
  });

  it('constructs with rawWorkbook param', () => {
    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Header1Data', 'Header2Data']
    ]);

    const xlsxWorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(xlsxWorkBook, xlsxWorkSheet);

    const csvWorkBook = new CSVWorkBook(xlsxWorkBook);

    expect(csvWorkBook).not.to.be.null;
    expect(csvWorkBook.rawWorkbook).not.to.be.null;
    expect(csvWorkBook.worksheets['Sheet1']).not.to.be.null;
  });
});

describe('CSVWorksheet', () => {
  it('constructs', () => {
    const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
      ['Header1', 'Header2'],
      ['Header1Data', 'Header2Data']
    ]);

    const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

    expect(csvWorksheet).not.to.be.null;
  });

  describe('getHeaders', () => {
    it('returns empty array if the worksheet is null', () => {
      const xlsxWorkSheet = (null as unknown) as xlsx.WorkSheet;

      const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

      expect(csvWorksheet).not.to.be.null;
      expect(csvWorksheet.getHeaders()).to.eql([]);
    });

    it('returns an array of headers', () => {
      const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
        ['Header1', 'Header2'],
        ['Header1Data', 'Header2Data']
      ]);

      const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

      expect(csvWorksheet).not.to.be.null;
      expect(csvWorksheet.getHeaders()).to.eql(['Header1', 'Header2']);
    });
  });

  describe('getRows', () => {
    it('returns empty array if the worksheet is null', () => {
      const xlsxWorkSheet = (null as unknown) as xlsx.WorkSheet;

      const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

      expect(csvWorksheet).not.to.be.null;
      expect(csvWorksheet.getRows()).to.eql([]);
    });

    it('returns an array of rows data arrays', () => {
      const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
        ['Header1', 'Header2'],
        ['Header1Data1', 'Header2Data1'],
        ['Header1Data2', 'Header2Data2']
      ]);

      const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

      expect(csvWorksheet).not.to.be.null;
      expect(csvWorksheet.getRows()).to.eql([
        ['Header1Data1', 'Header2Data1'],
        ['Header1Data2', 'Header2Data2']
      ]);
    });
  });

  describe('validate', () => {
    it('calls all provided validator functions', () => {
      const xlsxWorkSheet = xlsx.utils.aoa_to_sheet([
        ['Header1', 'Header2'],
        ['Header1Data1', 'Header2Data1'],
        ['Header1Data2', 'Header2Data2']
      ]);

      const csvWorksheet = new CSVWorksheet('Sheet1', xlsxWorkSheet);

      expect(csvWorksheet).not.to.be.null;

      const mockValidationFunction1 = sinon.stub();
      const mockValidationFunction2 = sinon.stub();
      const mockValidationFunction3 = sinon.stub();

      csvWorksheet.validate([mockValidationFunction1, mockValidationFunction2, mockValidationFunction3]);

      expect(mockValidationFunction1).to.have.been.calledOnce;
      expect(mockValidationFunction2).to.have.been.calledOnce;
      expect(mockValidationFunction3).to.have.been.calledOnce;
    });
  });
});

describe('CSVValidation', () => {
  it('constructs', () => {
    const csvValidation = new CSVValidation('fileName');

    expect(csvValidation).not.to.be.null;
  });

  describe('addFileErrors', () => {
    it('adds new file errors', () => {
      const csvValidation = new CSVValidation('fileName');

      expect(csvValidation).not.to.be.null;

      const fileError1 = 'a file error';
      const fileError2 = 'a second file error';

      csvValidation.addFileErrors([fileError1]);

      expect(csvValidation.fileErrors).to.eql([fileError1]);

      csvValidation.addFileErrors([fileError2]);

      expect(csvValidation.fileErrors).to.eql([fileError1, fileError2]);
    });
  });

  describe('addHeaderErrors', () => {
    it('adds new header errors', () => {
      const csvValidation = new CSVValidation('fileName');

      expect(csvValidation).not.to.be.null;

      const headerError1: IHeaderError = {
        errorCode: 'Duplicate Header',
        message: 'a header error',
        col: 0
      };

      const headerError2: IHeaderError = {
        errorCode: 'Unknown Header',
        message: 'a second header error',
        col: 1
      };

      csvValidation.addHeaderErrors([headerError1]);

      expect(csvValidation.headerErrors).to.eql([headerError1]);

      csvValidation.addHeaderErrors([headerError2]);

      expect(csvValidation.headerErrors).to.eql([headerError1, headerError2]);
    });
  });

  describe('addRowErrors', () => {
    it('adds new header errors', () => {
      const csvValidation = new CSVValidation('fileName');

      expect(csvValidation).not.to.be.null;

      const rowError1: IRowError = {
        errorCode: 'Missing Required Field',
        message: 'a row error',
        col: 'col1',
        row: 1
      };

      const rowError2: IRowError = {
        errorCode: 'Missing Required Field',
        message: 'a second row error',
        col: 'col1',
        row: 2
      };

      csvValidation.addRowErrors([rowError1]);

      expect(csvValidation.rowErrors).to.eql([rowError1]);

      csvValidation.addRowErrors([rowError2]);

      expect(csvValidation.rowErrors).to.eql([rowError1, rowError2]);
    });
  });

  describe('getState', () => {
    it('gets the current validation state', () => {
      const csvValidation = new CSVValidation('fileName');

      expect(csvValidation).not.to.be.null;

      const fileError1 = 'a file error';

      const headerError1: IHeaderError = {
        errorCode: 'Duplicate Header',
        message: 'a header error',
        col: 0
      };

      const rowError1: IRowError = {
        errorCode: 'Missing Required Field',
        message: 'a row error',
        col: 'col1',
        row: 1
      };

      csvValidation.addFileErrors([fileError1]);
      csvValidation.addHeaderErrors([headerError1]);
      csvValidation.addRowErrors([rowError1]);

      const validationState = csvValidation.getState();

      expect(validationState).to.eql({
        fileName: 'fileName',
        fileErrors: [fileError1],
        headerErrors: [headerError1],
        rowErrors: [rowError1],
        isValid: false
      });
    });
  });
});
