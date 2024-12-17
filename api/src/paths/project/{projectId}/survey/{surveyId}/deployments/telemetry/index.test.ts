import { expect } from 'chai';
import sinon from 'sinon';
import { getTelemetryForDeployments } from '.';
import * as db from '../../../../../../../database/db';
import { TelemetryVendorService } from '../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('getTelemetryForDeployments', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTelemetryForDeployments', () => {
    it('should return telemetry data for a single deployment', async () => {
      const mockDBConnection = getMockDBConnection({
        commit: sinon.stub(),
        release: sinon.stub(),
        open: sinon.stub(),
        rollback: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const serviceStub = sinon.stub(TelemetryVendorService.prototype, 'getTelemetryForDeployments').resolves([
        {
          telemetry_id: 1
        }
      ] as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      mockReq.body = {
        deployment_ids: [3, 4]
      };

      const requestHandler = getTelemetryForDeployments();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(serviceStub).to.have.been.calledOnceWithExactly(2, [3, 4]);
      expect(mockRes.json).to.have.been.calledOnceWith({ telemetry: [{ telemetry_id: 1 }] });
      expect(mockRes.status).calledOnceWithExactly(200);

      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.not.have.been.called;
    });
  });
});
