import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import * as strategy from '../../../../../../services/import-services/import-csv';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { importCsv } from './import';

describe('importCsv', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns imported critters', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCSV = sinon.stub(strategy, 'importCSV').resolves([1, 2]);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(getDBConnectionStub).to.have.been.calledOnce;

    expect(mockImportCSV).to.have.been.calledOnce;

    expect(mockRes.json).to.have.been.calledOnceWithExactly({ survey_critter_ids: [1, 2] });

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
