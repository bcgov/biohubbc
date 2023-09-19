import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { processAttachments } from './process';

chai.use(sinonChai);

describe('processKeyxAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should process keyx attachments', async () => {
    const dbConnectionObj = getMockDBConnection();
    const mockDBConnection = sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    const processKeyxRecordsStub = sinon.stub(AttachmentService.prototype, 'processKeyxRecords').resolves();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = processAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection).to.have.been.calledOnce;
    expect(processKeyxRecordsStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });

  it('should catch errors', async () => {
    const dbConnectionObj = getMockDBConnection();
    const mockDBConnection = sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    const processKeyxRecordsStub = sinon.stub(AttachmentService.prototype, 'processKeyxRecords').rejects();
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = processAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection).to.have.been.calledOnce;
    expect(processKeyxRecordsStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });
});
