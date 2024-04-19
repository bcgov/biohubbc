import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../../database/db';
import { BctwService } from '../../../../../../../../services/bctw-service';
import { SurveyCritterService } from '../../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';
import { deployDevice, PATCH, POST, updateDeployment } from './index';

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

  describe('upsertDeployment', () => {
    it('updates an existing deployment', async () => {
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').resolves();
      const mockBctwService = sinon.stub(BctwService.prototype, 'updateDeployment');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = updateDeployment();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockAddDeployment.calledOnce).to.be.true;
      expect(mockBctwService.calledOnce).to.be.true;
      expect(mockRes.status).to.have.been.calledWith(200);
    });

    it('catches and re-throws errors', async () => {
      const mockError = new Error('a test error');
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').rejects(mockError);
      const mockBctwService = sinon.stub(BctwService.prototype, 'updateDeployment').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const requestHandler = updateDeployment();
      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockGetDBConnection.calledOnce).to.be.true;
        expect(mockAddDeployment.calledOnce).to.be.true;
        expect(mockBctwService.notCalled).to.be.true;
      }
    });
    describe('deployDevice', () => {
      it('deploys a new telemetry device', async () => {
        const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
        const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').resolves();
        const mockBctwService = sinon.stub(BctwService.prototype, 'deployDevice');

        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

        const requestHandler = deployDevice();
        await requestHandler(mockReq, mockRes, mockNext);

        expect(mockGetDBConnection.calledOnce).to.be.true;
        expect(mockAddDeployment.calledOnce).to.be.true;
        expect(mockBctwService.calledOnce).to.be.true;
        expect(mockRes.status).to.have.been.calledWith(201);
      });

      it('catches and re-throws errors', async () => {
        const mockError = new Error('a test error');
        const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
        const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').rejects(mockError);
        const mockBctwService = sinon.stub(BctwService.prototype, 'deployDevice').rejects(mockError);

        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

        const requestHandler = deployDevice();
        try {
          await requestHandler(mockReq, mockRes, mockNext);
          expect.fail();
        } catch (actualError) {
          expect(actualError).to.equal(mockError);
          expect(mockGetDBConnection.calledOnce).to.be.true;
          expect(mockAddDeployment.calledOnce).to.be.true;
          expect(mockBctwService.notCalled).to.be.true;
        }
      });
    });
  });
});
