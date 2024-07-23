import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MediaFile } from '../../utils/media/media-file';
import { CSVImportStrategy } from './csv-import-strategy';
import { CSVImportService } from './csv-import-strategy.interface';

chai.use(sinonChai);

describe.only('CSVImportStrategy', () => {
  describe('import', () => {
    it('should pass correct values through chain', async () => {
      const mockCsv = new MediaFile('file', 'file', Buffer.from(''));
      const mockWorksheet = {};
      const mockData = [{ data: 'data' }];

      const importer: CSVImportService<any> = {
        columnValidator: { ID: { type: 'string' } },
        validateRows: sinon.stub(),
        insert: sinon.stub()
      };

      const strategy = new CSVImportStrategy(importer);

      const getWorksheetStub = sinon.stub(strategy, '_getWorksheet').returns(mockWorksheet);
      const validateStub = sinon.stub(strategy, '_validate').resolves(mockData);

      await strategy.import(mockCsv);

      expect(getWorksheetStub).to.have.been.called.calledOnceWithExactly(mockCsv);
      expect(validateStub).to.have.been.called.calledOnceWithExactly(mockWorksheet);
      expect(strategy.importCsvService.insert).to.have.been.called.calledOnceWithExactly(mockData);
    });
  });
});
