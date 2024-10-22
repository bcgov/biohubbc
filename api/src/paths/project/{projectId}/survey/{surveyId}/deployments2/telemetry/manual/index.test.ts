import { expect } from 'chai';
import sinon from 'sinon';
import { bulkCreateManualTelemetry, bulkUpdateManualTelemetry } from '.';
import * as db from '../../../../../../../../database/db';
import { TelemetryVendorService } from '../../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';

describe.only('getTelemetryForDeployments', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('bulkCreateManualTelemetry', () => {
    it('should return status 200', async () => {
      const mockDBConnection = getMockDBConnection({
        commit: sinon.stub(),
        release: sinon.stub(),
        open: sinon.stub(),
        rollback: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const serviceStub = sinon.stub(TelemetryVendorService.prototype, 'bulkCreateManualTelemetry');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const mockTelemetry = [
        {
          deployment2_id: 1,
          latitude: 1,
          longitude: 1,
          acquisition_date: '2021-01-01',
          transmission_date: '2021-01-01'
        }
      ];

      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      mockReq.body = {
        telemetry: mockTelemetry
      };

      const requestHandler = bulkCreateManualTelemetry();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(serviceStub).to.have.been.calledOnceWithExactly(2, mockTelemetry);

      expect(mockRes.status).calledOnceWithExactly(201);
      expect(mockRes.send).calledOnceWithExactly();

      expect(mockDBConnection.commit).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.not.have.been.called;
    });
  });

  describe('bulkUpdateManualTelemetry', () => {
    {
      it('should return status 200', async () => {
        const mockDBConnection = getMockDBConnection({
          commit: sinon.stub(),
          release: sinon.stub(),
          open: sinon.stub(),
          rollback: sinon.stub()
        });

        sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

        const serviceStub = sinon.stub(TelemetryVendorService.prototype, 'bulkUpdateManualTelemetry');

        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

        const mockTelemetry = [
          {
            telemetry_manual_id: 'uuid',
            latitude: 1,
            longitude: 1,
            acquisition_date: '2021-01-01',
            transmission_date: '2021-01-01'
          }
        ];

        mockReq.params = {
          projectId: '1',
          surveyId: '2'
        };

        mockReq.body = {
          telemetry: mockTelemetry
        };

        const requestHandler = bulkUpdateManualTelemetry();

        await requestHandler(mockReq, mockRes, mockNext);

        expect(mockDBConnection.open).to.have.been.calledOnce;

        expect(serviceStub).to.have.been.calledOnceWithExactly(2, mockTelemetry);

        expect(mockRes.status).calledOnceWithExactly(200);
        expect(mockRes.send).calledOnceWithExactly();

        expect(mockDBConnection.commit).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;

        expect(mockDBConnection.rollback).to.not.have.been.called;
      });
    }
  });
});
