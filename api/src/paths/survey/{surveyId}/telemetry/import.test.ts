import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../database/db';
import { HTTP422CSVValidationError } from '../../../../errors/http-error';
import { ImportTelemetryService } from '../../../../services/import-services/telemetry/import-telemetry-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { importTelemetryCSV } from './import';

describe('importTelemetryCSV', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('imports telemetry CSV returns status 200', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const importCSVWorksheetStub = sinon.stub(ImportTelemetryService.prototype, 'importCSVWorksheet');

    importCSVWorksheetStub.resolves([]);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importTelemetryCSV();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(getDBConnectionStub).to.have.been.calledOnce;

    expect(importCSVWorksheetStub).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledOnceWithExactly(200);
    expect(mockRes.send).to.have.been.calledOnceWithExactly();

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('fails validation and returns status 422 with errors', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const importCSVWorksheetStub = sinon.stub(ImportTelemetryService.prototype, 'importCSVWorksheet');

    importCSVWorksheetStub.resolves([
      {
        error: 'Test error',
        solution: 'Test solution',
        row: 1,
        header: 'TEST'
      }
    ]);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importTelemetryCSV();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err: any) {
      expect(err).to.be.instanceOf(HTTP422CSVValidationError);
      expect(err.errors).to.deep.equal([
        {
          error: 'Test error',
          solution: 'Test solution',
          row: 1,
          header: 'TEST'
        }
      ]);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(importCSVWorksheetStub).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
