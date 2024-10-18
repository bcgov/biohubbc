import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { DeploymentService } from '../../../../../../services/deployment-services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../.././../../__mocks__/db';
import { deleteDeploymentsInSurvey } from './delete';

chai.use(sinonChai);

describe('deleteDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete all provided deployment records', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      deployment_ids: [3, 4]
    };

    sinon.stub(DeploymentService.prototype, 'deleteDeployments').resolves();

    const requestHandler = deleteDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should catch and re-throw an error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      deployment_ids: [3, 4]
    };

    const mockError = new Error('test error');

    sinon.stub(DeploymentService.prototype, 'deleteDeployments').rejects(mockError);

    const requestHandler = deleteDeploymentsInSurvey();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.eql(mockError);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
