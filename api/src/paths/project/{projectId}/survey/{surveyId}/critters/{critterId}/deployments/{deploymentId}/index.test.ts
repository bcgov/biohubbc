import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import { DELETE, deleteDeployment } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../../__mocks__/db';
import * as db from '../../../../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../../../../services/bctw-service/bctw-deployment-service';
import { DeploymentService } from '../../../../../../../../../services/deployment-service';

describe('critter deployments', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(DELETE.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('deleteDeployment', () => {
    it('deletes an existing deployment', async () => {
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockRemoveDeployment = sinon.stub(DeploymentService.prototype, 'endDeployment').resolves();
      const mockBctwService = sinon.stub(BctwDeploymentService.prototype, 'deleteDeployment');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = deleteDeployment();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockRemoveDeployment.calledOnce).to.be.true;
      expect(mockBctwService.calledOnce).to.be.true;
      expect(mockRes.status).to.have.been.calledWith(200);
    });
  });
});
