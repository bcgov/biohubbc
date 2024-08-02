import { expect } from 'chai';
import sinon from 'sinon';
import { SystemUser } from '../../repositories/user-repository';
import { BctwTelemetryService, IAllTelemetry } from '../../services/bctw-service/bctw-telemetry-service';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { getAllTelemetryByDeploymentIds } from './deployments';

const mockTelemetry: IAllTelemetry[] = [
  {
    telemetry_id: null,
    telemetry_manual_id: '123-123-123',
    deployment_id: '345-345-345',
    latitude: 49.123,
    longitude: -126.123,
    acquisition_date: '2021-01-01',
    telemetry_type: 'manual'
  },
  {
    telemetry_id: '567-567-567',
    telemetry_manual_id: null,
    deployment_id: '345-345-345',
    latitude: 49.123,
    longitude: -126.123,
    acquisition_date: '2021-01-01',
    telemetry_type: 'vendor'
  }
];

describe('getAllTelemetryByDeploymentIds', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should retrieve both manual and vendor telemetry', async () => {
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getAllTelemetryByDeploymentIds')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getAllTelemetryByDeploymentIds();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetTelemetry).to.have.been.calledOnce;
  });
  it('should catch error', async () => {
    const mockError = new Error('test error');
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getAllTelemetryByDeploymentIds')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getAllTelemetryByDeploymentIds();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    }
  });
});
