import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MediaFile } from '../../utils/media/media-file';
import * as worksheetUtils from '../../utils/xlsx-utils/worksheet-utils';
import { importCSV } from './csv-import-strategy';
import { CSVImportService } from './csv-import-strategy.interface';

chai.use(sinonChai);

describe('importCSV', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('should pass correct values through chain', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
    const mockWorksheet = {};

    const importer: CSVImportService<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().resolves({ success: true, data: true }),
      insert: sinon.stub().resolves(true)
    };

    const getWorksheetStub = sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(mockWorksheet);
    const validateCsvFileStub = sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);

    const data = await importCSV(mockCsv, importer);

    expect(getWorksheetStub).to.have.been.called.calledOnceWithExactly(worksheetUtils.constructXLSXWorkbook(mockCsv));
    expect(validateCsvFileStub).to.have.been.called.calledOnceWithExactly(mockWorksheet, importer.columnValidator);
    expect(importer.insert).to.have.been.called.calledOnceWithExactly(true);
    expect(data).to.be.true;
  });

  it('should throw error if column validator fails', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));

    const importer: CSVImportService<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().resolves({ success: true, data: true }),
      insert: sinon.stub().resolves(true)
    };

    sinon.stub(worksheetUtils, 'validateCsvFile').returns(false);

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
            columnFormat: undefined,
            columnAliases: undefined,
            optional: undefined
          }
        ]
      });
    }
  });

  it('should throw error if import service validateRows fails', async () => {
    const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
    const mockWorksheet = {};
    const mockValidation = { success: false, error: { issues: [{ row: 1, message: 'invalidated' }] } };

    const importer: CSVImportService<any> = {
      columnValidator: { ID: { type: 'string' } },
      validateRows: sinon.stub().returns(mockValidation),
      insert: sinon.stub().resolves(true)
    };

    sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(mockWorksheet);
    sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);

    try {
      await importCSV(mockCsv, importer);
      expect.fail();
    } catch (err: any) {
      expect(importer.validateRows).to.have.been.calledOnceWithExactly([], mockWorksheet);
      expect(err.message).to.be.eql(`Failed to import Critter CSV. Column data validator failed.`);
      expect(err.errors[0]).to.be.eql({
        csv_row_errors: mockValidation.error.issues
      });
    }
  });
});
