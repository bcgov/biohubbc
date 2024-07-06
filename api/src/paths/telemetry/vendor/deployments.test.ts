import { expect } from 'chai';
import sinon from 'sinon';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { BctwTelemetryService, IVendorTelemetry } from '../../../services/bctw-service/bctw-telemetry-service';
import { getVendorTelemetryByDeploymentIds } from './deployments';

const mockTelemetry: IVendorTelemetry[] = [
  {
    telemetry_id: '123-123-123',
    deployment_id: '345-345-345',
    latitude: 49.123,
    longitude: -126.123,
    acquisition_date: '2021-01-01',
    collar_transaction_id: '45-45-45',
    critter_id: '78-78-78',
    deviceid: 123456,
    elevation: 200,
    vendor: 'vendor1'
  },
  {
    telemetry_id: '456-456-456',
    deployment_id: '789-789-789',
    latitude: 49.123,
    longitude: -126.123,
    acquisition_date: '2021-01-01',
    collar_transaction_id: '54-54-54',
    critter_id: '87-87-87',
    deviceid: 654321,
    elevation: 10,
    vendor: 'vendor2'
  }
];

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
