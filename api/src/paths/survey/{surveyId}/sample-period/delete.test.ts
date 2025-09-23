import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SamplePeriodService } from '../../../../services/sample-period-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { deleteSamplePeriods } from './delete';

chai.use(sinonChai);

describe('deleteSamplePeriods', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully delete sample periods', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      release: sinon.stub(),
      commit: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SamplePeriodService.prototype, 'deleteSamplePeriods').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      surveyId: '1'
    };

    mockReq.body = {
      surveySamplePeriodIds: [1, 2, 3]
    };

    const requestHandler = deleteSamplePeriods();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(201);
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
    expect(mockRes.send).to.have.been.calledOnce;
  });

  it('should handle and re-throw errors', async () => {
    const mockDBConnection = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Database error');

    sinon.stub(SamplePeriodService.prototype, 'deleteSamplePeriods').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    mockReq.body = {
      surveySamplePeriodIds: [1, 2]
    };

    const requestHandler = deleteSamplePeriods();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Database error');
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
