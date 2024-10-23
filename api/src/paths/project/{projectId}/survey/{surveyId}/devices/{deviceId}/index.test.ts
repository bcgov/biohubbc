import { expect } from 'chai';
import sinon from 'sinon';
import { deleteDevice, getDevice, updateDevice } from '.';
import * as db from '../../../../../../../database/db';
import { TelemetryDeviceService } from '../../../../../../../services/telemetry-services/telemetry-device-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('getDevice', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Gets an existing device', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockDevice = {
      device_id: 1,
      survey_id: 66,
      device_key: 'key',
      serial: '123456',
      device_make_id: 1,
      model: 'ModelX',
      comment: 'Comment'
    };

    sinon.stub(TelemetryDeviceService.prototype, 'getDevice').resolves(mockDevice);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };

    const requestHandler = getDevice();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledWith({ device: mockDevice });
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    sinon.stub(TelemetryDeviceService.prototype, 'getDevice').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };

    const requestHandler = getDevice();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('updateDevice', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates an existing device', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(TelemetryDeviceService.prototype, 'updateDevice').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };
    mockReq.body = {
      serial: '123456',
      device_make_id: 1,
      model: 'ModelX',
      comment: null
    };

    const requestHandler = updateDevice();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    sinon.stub(TelemetryDeviceService.prototype, 'updateDevice').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };

    const requestHandler = updateDevice();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('deleteDevice', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes an existing device', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(TelemetryDeviceService.prototype, 'deleteDevice').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };

    const requestHandler = deleteDevice();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    sinon.stub(TelemetryDeviceService.prototype, 'deleteDevice').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deviceId: '3'
    };

    const requestHandler = deleteDevice();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
