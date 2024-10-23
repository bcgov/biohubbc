import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../../database/db';
import { TelemetryVendorService } from '../../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';
import { bulkDeleteManualTelemetry } from './delete';

describe('telemetry/manual/delete', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('bulkDeleteManualTelemetry', () => {
    it('should return status 200', async () => {
      const mockDBConnection = getMockDBConnection({
        commit: sinon.stub(),
        release: sinon.stub(),
        open: sinon.stub(),
        rollback: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const serviceStub = sinon.stub(TelemetryVendorService.prototype, 'bulkDeleteManualTelemetry');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      mockReq.body = {
        telemetry_manual_ids: ['uuid1', 'uuid2']
      };

      const requestHandler = bulkDeleteManualTelemetry();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(serviceStub).to.have.been.calledOnceWithExactly(2, ['uuid1', 'uuid2']);

      expect(mockRes.status).calledOnceWithExactly(200);
      expect(mockRes.send).calledOnceWithExactly();

      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.not.have.been.called;
    });
  });
});
