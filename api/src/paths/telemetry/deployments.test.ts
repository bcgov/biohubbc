import { expect } from 'chai';
import sinon from 'sinon';
import { BctwService, IManualTelemetry } from '../../services/bctw-service';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { getAllTelemetryByDeploymentIds } from './deployments';

const mockTelemetry = ([
  {
    telemetry_manual_id: 1
  },
  {
    telemetry_manual_id: 2
  }
] as unknown[]) as IManualTelemetry[];

describe('getAllTelemetryByDeploymentIds', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should retrieve both manual and vendor telemetry', async () => {
    const mockGetTelemetry = sinon
      .stub(BctwService.prototype, 'getAllTelemetryByDeploymentIds')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getAllTelemetryByDeploymentIds();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetTelemetry).to.have.been.calledOnce;
  });
  it('should catch error', async () => {
    const mockError = new Error('test error');
    const mockGetTelemetry = sinon.stub(BctwService.prototype, 'getAllTelemetryByDeploymentIds').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getAllTelemetryByDeploymentIds();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    }
  });
});
