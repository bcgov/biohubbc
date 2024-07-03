import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import { createDeployment, POST } from '.';
import * as db from '../../../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../../../services/bctw-service/bctw-deployment-service';
import { DeploymentService } from '../../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';
import { PATCH, updateDeployment } from './{deploymentId}';

describe('critter deployments', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(POST.apiDoc as unknown as object)).to.be.true;
      expect(ajv.validateSchema(PATCH.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('updateDeployment', () => {
    it('updates an existing deployment', async () => {
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockcreateDeployment = sinon.stub(DeploymentService.prototype, 'updateDeployment').resolves();
      const mockBctwDeploymentService = sinon.stub(BctwDeploymentService.prototype, 'updateDeployment');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = updateDeployment();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockcreateDeployment.calledOnce).to.be.true;
      expect(mockBctwDeploymentService.calledOnce).to.be.true;
      expect(mockRes.status).to.have.been.calledWith(200);
    });

    it('catches and re-throws errors', async () => {
      const mockError = new Error('a test error');
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockcreateDeployment = sinon.stub(DeploymentService.prototype, 'updateDeployment').rejects(mockError);
      const mockBctwDeploymentService = sinon
        .stub(BctwDeploymentService.prototype, 'updateDeployment')
        .rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = updateDeployment();
      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockGetDBConnection.calledOnce).to.be.true;
        expect(mockcreateDeployment.calledOnce).to.be.true;
        expect(mockBctwDeploymentService.notCalled).to.be.true;
      }
    });
    describe('createDeployment', () => {
      it('deploys a new telemetry device', async () => {
        const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
        const mockcreateDeployment = sinon.stub(DeploymentService.prototype, 'updateDeployment').resolves();
        const mockBctwDeploymentService = sinon.stub(BctwDeploymentService.prototype, 'createDeployment');

        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

        const requestHandler = createDeployment();

        await requestHandler(mockReq, mockRes, mockNext);

        expect(mockGetDBConnection.calledOnce).to.be.true;
        expect(mockcreateDeployment.calledOnce).to.be.true;
        expect(mockBctwDeploymentService.calledOnce).to.be.true;
        expect(mockRes.status).to.have.been.calledWith(201);
      });

      it('catches and re-throws errors', async () => {
        const mockError = new Error('a test error');
        const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
        const mockcreateDeployment = sinon.stub(DeploymentService.prototype, 'updateDeployment').rejects(mockError);
        const mockBctwDeploymentService = sinon
          .stub(BctwDeploymentService.prototype, 'createDeployment')
          .rejects(mockError);

        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

        const requestHandler = createDeployment();
        try {
          await requestHandler(mockReq, mockRes, mockNext);
          expect.fail();
        } catch (actualError) {
          expect(actualError).to.equal(mockError);
          expect(mockGetDBConnection.calledOnce).to.be.true;
          expect(mockcreateDeployment.calledOnce).to.be.true;
          expect(mockBctwDeploymentService.notCalled).to.be.true;
        }
      });
    });
  });
});
