import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MediaFile } from '../../utils/media/media-file';
import * as worksheetUtils from '../../utils/xlsx-utils/worksheet-utils';
import { importCSV } from './import-csv';
import { CSVImportStrategy } from './import-csv.interface';

chai.use(sinonChai);

describe('importCSV', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('should pass correct values through chain', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
    const mockWorksheet = {};

    const importer: CSVImportStrategy<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().resolves({ success: true, data: true }),
      insert: sinon.stub().resolves(true)
    };

    const getWorksheetStub = sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(mockWorksheet);
    const validateCsvFileStub = sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);
    const getWorksheetRowsStub = sinon.stub(worksheetUtils, 'getWorksheetRowObjects').returns([{ ID: '1' }]);

    const data = await importCSV(mockCsv, importer);

    expect(getWorksheetStub).to.have.been.called.calledOnceWithExactly(worksheetUtils.constructXLSXWorkbook(mockCsv));
    expect(validateCsvFileStub).to.have.been.called.calledOnceWithExactly(mockWorksheet, importer.columnValidator);
    expect(getWorksheetRowsStub).to.have.been.called.calledOnceWithExactly(mockWorksheet);
    expect(importer.insert).to.have.been.called.calledOnceWithExactly(true);
    expect(data).to.be.true;
  });

  it('should throw error if column validator fails', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));

    const importer: CSVImportStrategy<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().resolves({ success: true, data: true }),
      insert: sinon.stub().resolves(true)
    };

    sinon.stub(worksheetUtils, 'validateCsvFile').returns(false);
    sinon.stub(worksheetUtils, 'getWorksheetRowObjects').returns([{ ID: '1' }]);

    try {
      await importCSV(mockCsv, importer);

      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.eql(`Column validator failed. Column headers or cell data types are incorrect.`);
      expect(err.errors[0]).to.be.eql({
        csv_column_errors: [
          {
            columnName: 'ID',
            columnType: 'string',
            columnAliases: undefined,
            optional: undefined
          }
        ]
      });
    }
  });

  it('should throw error if import strategy validateRows fails', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
    const mockWorksheet = {};
    const mockValidation = { success: false, error: { issues: [{ row: 1, message: 'invalidated' }] } };

    const importer: CSVImportStrategy<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().returns(mockValidation),
      insert: sinon.stub().resolves(true)
    };

    sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(mockWorksheet);
    sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);
    sinon.stub(worksheetUtils, 'getWorksheetRowObjects').returns([{ BAD_ID: '1' }]);

    try {
      await importCSV(mockCsv, importer);
      expect.fail();
    } catch (err: any) {
      expect(importer.validateRows).to.have.been.calledOnceWithExactly([{ BAD_ID: '1' }], mockWorksheet);
      expect(err.message).to.be.eql(`Cell validator failed. Cells have invalid reference values.`);
      expect(err.errors[0]).to.be.eql({
        csv_row_errors: mockValidation.error.issues
      });
    }
  });

  it('should throw error if CSV contains no rows', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
    const mockWorksheet = {};
    const mockValidation = { success: false, error: { issues: [{ row: 1, message: 'invalidated' }] } };

    const importer: CSVImportStrategy<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().returns(mockValidation),
      insert: sinon.stub().resolves(true)
    };

    sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(mockWorksheet);
    sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);
    sinon.stub(worksheetUtils, 'getWorksheetRowObjects').returns([]);

    try {
      await importCSV(mockCsv, importer);
      expect.fail();
    } catch (err: any) {
      expect(importer.validateRows).to.not.have.been.called;
      expect(err.message).to.be.eql(`Row validator failed. No rows found in the CSV file.`);
    }
  });
});
