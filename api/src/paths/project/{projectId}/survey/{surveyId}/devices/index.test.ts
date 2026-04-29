import { expect } from 'chai';
import sinon from 'sinon';
import { createDevice, getDevicesInSurvey } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as db from '../../../../../../database/db';
import { ApiError, ApiGeneralError } from '../../../../../../errors/api-error';
import { TelemetryDeviceService } from '../../../../../../services/telemetry-services/telemetry-device-service';

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

  describe('createDevice', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('successfully creates a device', async () => {
      const mockDBConnection = getMockDBConnection({
        release: sinon.stub(),
        rollback: sinon.stub(),
        commit: sinon.stub()
      });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockSurveyId = '2';
      const mockSerial = '123456';
      const mockDeviceMakeId = 1;
      const mockModel = 'ModelX';
      const mockComment = 'Device Comment';

      const mockDevice = null; // Device doesn't exist, so no error should be thrown

      sinon.stub(TelemetryDeviceService.prototype, 'findDeviceBySerial').resolves(mockDevice);
      sinon.stub(TelemetryDeviceService.prototype, 'createDevice').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        surveyId: mockSurveyId
      };

      mockReq.body = {
        serial: mockSerial,
        device_make_id: mockDeviceMakeId,
        model: mockModel,
        comment: mockComment
      };

      const requestHandler = createDevice();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledOnceWith(200);
      expect(mockRes.send).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    });

    it('throws error when device already exists', async () => {
      const mockDBConnection = getMockDBConnection({
        release: sinon.stub(),
        rollback: sinon.stub()
      });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockSurveyId = '2';
      const mockSerial = '123456';
      const mockDeviceMakeId = 1;
      const mockModel = 'ModelX';
      const mockComment = 'Device Comment';

      const existingDevice = {
        serial: mockSerial,
        device_make_id: mockDeviceMakeId,
        device_id: 1,
        survey_id: 1,
        device_key: '1:lotek',
        model: null,
        comment: 'comment'
      };

      sinon.stub(TelemetryDeviceService.prototype, 'findDeviceBySerial').resolves(existingDevice);
      sinon.stub(TelemetryDeviceService.prototype, 'createDevice').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        surveyId: mockSurveyId
      };

      mockReq.body = {
        serial: mockSerial,
        device_make_id: mockDeviceMakeId,
        model: mockModel,
        comment: mockComment
      };

      const requestHandler = createDevice();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail('Error should have been thrown');
      } catch (error) {
        // Assertions
        expect(error).to.be.an.instanceOf(ApiGeneralError);
        expect((error as ApiError).message).to.equal(
          `Device ${mockSerial} of the given make already exists in the Survey.`
        );
        expect(mockDBConnection.release).to.have.been.calledOnce;
      }
    });

    it('handles errors and rolls back transaction', async () => {
      // Mock DB connection
      const mockDBConnection = getMockDBConnection({
        release: sinon.stub(),
        rollback: sinon.stub()
      });
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockError = new Error('Database error');
      sinon.stub(TelemetryDeviceService.prototype, 'findDeviceBySerial').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        surveyId: '2'
      };

      mockReq.body = {
        serial: '123456',
        device_make_id: 1,
        model: 'ModelX',
        comment: 'Device Comment'
      };

      const requestHandler = createDevice();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail('Error should have been thrown');
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockDBConnection.rollback).to.have.been.calledOnce;
        expect(mockDBConnection.release).to.have.been.calledOnce;
      }
    });
  });
});
