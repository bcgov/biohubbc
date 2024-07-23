import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MediaFile } from '../../utils/media/media-file';
import * as worksheetUtils from '../../utils/xlsx-utils/worksheet-utils';
import { CSVImportStrategy } from './csv-import-strategy';
import { CSVImportService } from './csv-import-strategy.interface';

chai.use(sinonChai);

describe.only('CSVImportStrategy', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('import', () => {
    it('should pass correct values through chain', async () => {
      const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
      const mockWorksheet = {};
      const mockData = [{ data: 'data' }];

      const importer: CSVImportService<any> = {
        columnValidator: { ID: { type: 'string' } },
        validateRows: sinon.stub(),
        insert: sinon.stub().resolves(true)
      };

      const strategy = new CSVImportStrategy(importer);

      const getWorksheetStub = sinon.stub(strategy, '_getWorksheet').returns(mockWorksheet);
      const validateStub = sinon.stub(strategy, '_validate').resolves(mockData);

      const data = await strategy.import(mockCsv);

      expect(getWorksheetStub).to.have.been.called.calledOnceWithExactly(mockCsv);
      expect(validateStub).to.have.been.called.calledOnceWithExactly(mockWorksheet);
      expect(strategy.importCsvService.insert).to.have.been.called.calledOnceWithExactly(mockData);
      expect(data).to.be.true;
    });
  });

  describe('_validate', () => {
    it('should throw error if column validator fails', async () => {
      const mockWorksheet = {};

      const importer: CSVImportService<any> = {
        columnValidator: { ID: { type: 'string' } },
        validateRows: sinon.stub(),
        insert: sinon.stub().resolves(true)
      };

      const strategy = new CSVImportStrategy(importer);
      sinon.stub(worksheetUtils, 'validateCsvFile').returns(false);

      try {
        await strategy._validate(mockWorksheet);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.be.eql(`Column validator failed. Column headers or cell data types are incorrect.`);
        expect(err.errors[0]).to.be.eql({
          csv_column_errors: [{ columnName: 'ID', columnType: 'string', columnAliases: undefined }]
        });
      }
    });

    it('should throw error if import service validateRows fails', async () => {
      const mockWorksheet = {};
      const mockValidation = { success: false, error: { issues: [{ row: 1, message: 'invalidated' }] } };

      const importer: CSVImportService<any> = {
        columnValidator: { ID: { type: 'string' } },
        validateRows: sinon.stub().returns(mockValidation),
        insert: sinon.stub().resolves(true)
      };

      const strategy = new CSVImportStrategy(importer);
      sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);

      try {
        await strategy._validate(mockWorksheet);
        expect.fail();
      } catch (err: any) {
        expect(importer.validateRows).to.have.been.calledOnceWithExactly([], mockWorksheet);
        expect(err.message).to.be.eql(`Failed to import Critter CSV. Column data validator failed.`);
        expect(err.errors[0]).to.be.eql({
          csv_row_errors: mockValidation.error.issues
        });
      }
    });

    it('should return valiated data on success', async () => {
      const mockWorksheet = {};
      const mockValidation = { success: true, data: true };

      const importer: CSVImportService<any> = {
        columnValidator: { ID: { type: 'string' } },
        validateRows: sinon.stub().returns(mockValidation),
        insert: sinon.stub().resolves(true)
      };

      const strategy = new CSVImportStrategy(importer);
      sinon.stub(worksheetUtils, 'validateCsvFile').returns(true);

      const data = await strategy._validate(mockWorksheet);

      expect(importer.validateRows).to.have.been.calledOnceWithExactly([], mockWorksheet);
      expect(data).to.be.true;
    });
  });
});
