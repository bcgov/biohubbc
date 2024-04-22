import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../../database/db';
import { BctwService } from '../../../../../../../../services/bctw-service';
import { SurveyCritterService } from '../../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';
import { DELETE, deleteDeployment } from './{bctwDeploymentId}';

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
      const mockRemoveDeployment = sinon.stub(SurveyCritterService.prototype, 'removeDeployment').resolves();
      const mockBctwService = sinon.stub(BctwService.prototype, 'deleteDeployment');

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
