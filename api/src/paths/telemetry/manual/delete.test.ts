import { expect } from 'chai';
import sinon from 'sinon';
import { SystemUser } from '../../../repositories/user-repository';
import { IManualTelemetry } from '../../../services/bctw-service';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { deleteManualTelemetry } from './delete';

const mockTelemetry = [
  {
    telemetry_manual_id: 1
  },
  {
    telemetry_manual_id: 2
  }
] as unknown[] as IManualTelemetry[];

describe('deleteManualTelemetry', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should retrieve all manual telemetry', async () => {
    const mockGetTelemetry = sinon
      .stub(BctwTelemetryService.prototype, 'deleteManualTelemetry')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = deleteManualTelemetry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetTelemetry).to.have.been.calledOnce;
  });
  it('should catch error', async () => {
    const mockError = new Error('test error');
    const mockGetTelemetry = sinon.stub(BctwTelemetryService.prototype, 'deleteManualTelemetry').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = deleteManualTelemetry();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(mockGetTelemetry).to.have.been.calledOnce;
    }
  });
});
