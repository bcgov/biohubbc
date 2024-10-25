import { expect } from 'chai';
import sinon from 'sinon';
import { getDevicesInSurvey } from '.';
import * as db from '../../../../../../database/db';
import { TelemetryDeviceService } from '../../../../../../services/telemetry-services/telemetry-device-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getDevicesInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets devices in survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockDevices = [
      {
        device_id: 1,
        survey_id: 66,
        device_key: 'key',
        serial: '123456',
        device_make_id: 1,
        model: 'ModelX',
        comment: 'Comment'
      }
    ];

    sinon.stub(TelemetryDeviceService.prototype, 'getDevicesForSurvey').resolves(mockDevices);
    sinon.stub(TelemetryDeviceService.prototype, 'getDevicesCount').resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getDevicesInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledOnceWith({
      devices: mockDevices,
      count: 1,
      pagination: {
        total: 1,
        per_page: 1,
        current_page: 1,
        last_page: 1,
        sort: undefined,
        order: undefined
      }
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    sinon.stub(TelemetryDeviceService.prototype, 'getDevicesForSurvey').rejects(mockError);
    sinon.stub(TelemetryDeviceService.prototype, 'getDevicesCount').resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getDevicesInSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
