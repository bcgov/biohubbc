import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../.././../../__mocks__/db';
import { deleteDeploymentsInSurvey } from './delete';

chai.use(sinonChai);

describe('deleteDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete all provided deployment records from sims and bctw', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      deployment_ids: [3, 4]
    };

    const mockDeleteSimsDeploymentResponse = { bctw_deployment_id: '123-456-789' };

    sinon.stub(DeploymentService.prototype, 'deleteDeployment').resolves(mockDeleteSimsDeploymentResponse);
    sinon.stub(BctwDeploymentService.prototype, 'deleteDeployment').resolves();

    const requestHandler = deleteDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should catch and re-throw an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.body = {
      deployment_ids: [3, 4]
    };

    const mockDeleteSimsDeploymentResponse = { bctw_deployment_id: '123-456-789' };
    const mockError = new Error('test error');

    sinon.stub(DeploymentService.prototype, 'deleteDeployment').resolves(mockDeleteSimsDeploymentResponse);
    sinon.stub(BctwDeploymentService.prototype, 'deleteDeployment').throws(mockError);

    const requestHandler = deleteDeploymentsInSurvey();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.eql(mockError);
    }
  });
});
