import { expect } from 'chai';
import sinon from 'sinon';
import { IManualTelemetry } from '../../../models/bctw';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getVendorTelemetryByDeploymentIds } from './deployments';

const mockTelemetry = [
  {
    telemetry_manual_id: 1
  },
  {
    telemetry_manual_id: 2
  }
] as unknown[] as IManualTelemetry[];

describe('getVendorTelemetryByDeploymentIds', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should retrieve all vendor telemetry by deployment ids', async () => {
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getVendorTelemetryByDeploymentIds')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getVendorTelemetryByDeploymentIds();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetTelemetry).to.have.been.calledOnce;
  });
  it('should catch error', async () => {
    const mockError = new Error('test error');
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getVendorTelemetryByDeploymentIds')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getVendorTelemetryByDeploymentIds();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    }
  });
});
