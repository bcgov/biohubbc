import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../../../errors/http-error';
import { ImportHabitatFeaturesService } from '../../../../../../services/import-services/habitat-feature/import-habitat-features-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { importHabitatFeatureCSV } from './import';

chai.use(sinonChai);

describe('importHabitatFeatureCSV', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('status 204 when successful', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const importCSVWorksheetStub = sinon.stub(ImportHabitatFeaturesService.prototype, 'importCSVWorksheet');

    importCSVWorksheetStub.resolves([]);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importHabitatFeatureCSV();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(getDBConnectionStub).to.have.been.calledOnce;

    expect(importCSVWorksheetStub).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledOnceWithExactly(204);
    expect(mockRes.send).to.have.been.calledOnceWithExactly();

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('status 422 when CSV validation errors', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const importCSVWorksheetStub = sinon.stub(ImportHabitatFeaturesService.prototype, 'importCSVWorksheet');

    importCSVWorksheetStub.resolves([{ error: 'error', solution: 'solution' }]);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importHabitatFeatureCSV();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected an 422 error to be thrown');
    } catch (err) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(getDBConnectionStub).to.have.been.calledOnce;

      expect(importCSVWorksheetStub).to.have.been.calledOnce;

      expect(mockDBConnection.commit).to.have.not.been.called;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(err).to.be.instanceOf(HTTP422CSVValidationError);
    }
  });
});
