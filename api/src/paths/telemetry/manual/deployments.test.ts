import { expect } from 'chai';
import sinon from 'sinon';
import { SystemUser } from '../../../repositories/user-repository';
import { BctwTelemetryService, IManualTelemetry } from '../../../services/bctw-service/bctw-telemetry-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getManualTelemetryByDeploymentIds } from './deployments';

const mockTelemetry = [
  {
    telemetry_manual_id: 1
  },
  {
    telemetry_manual_id: 2
  }
] as unknown[] as IManualTelemetry[];

describe('getManualTelemetryByDeploymentIds', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should retrieve all manual telemetry', async () => {
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getManualTelemetryByDeploymentIds')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getManualTelemetryByDeploymentIds();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetTelemetry).to.have.been.calledOnce;
  });
  it('should catch error', async () => {
    const mockError = new Error('test error');
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'getManualTelemetryByDeploymentIds')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getManualTelemetryByDeploymentIds();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    }
  });
});
