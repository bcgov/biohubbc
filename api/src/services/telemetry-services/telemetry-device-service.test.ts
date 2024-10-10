import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { TelemetryDeviceRepository } from '../../repositories/telemetry-repositories/telemetry-device-repository';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryDeviceService } from './telemetry-device-service';

chai.use(sinonChai);

describe.only('TelemetryDeviceService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getDevice', () => {
    it('should return a device by its ID', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon.stub(TelemetryDeviceRepository.prototype, 'getDevicesByIds').resolves([true] as any);

      const device = await service.getDevice(1, 2);

      expect(repoStub).to.have.been.calledOnceWithExactly(1, [2]);
      expect(device).to.be.true;
    });

    it('should throw an error if unable to get device', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon.stub(TelemetryDeviceRepository.prototype, 'getDevicesByIds').resolves([]);

      try {
        await service.getDevice(1, 2);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Device not found');
      }

      expect(repoStub).to.have.been.calledOnceWithExactly(1, [2]);
    });
  });

  describe('deleteDevice', () => {
    it('should delete a device by its ID', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon
        .stub(TelemetryDeviceRepository.prototype, 'deleteDevicesByIds')
        .resolves([{ device_id: 2 }] as any);

      const device = await service.deleteDevice(1, 2);

      expect(repoStub).to.have.been.calledOnceWithExactly(1, [2]);
      expect(device).to.be.equal(2);
    });

    it('should throw an error if unable to delete device', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon.stub(TelemetryDeviceRepository.prototype, 'deleteDevicesByIds').resolves([]);

      try {
        await service.deleteDevice(1, 2);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Unable to delete device');
      }

      expect(repoStub).to.have.been.calledOnceWithExactly(1, [2]);
    });
  });

  describe('createDevice', () => {
    it('should delete a device by its ID', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon.stub(TelemetryDeviceRepository.prototype, 'createDevice').resolves(true as any);

      const device = await service.createDevice({
        device_make_id: 1,
        model: null,
        survey_id: 1,
        serial: 'serial',
        comment: 'comment'
      });

      expect(repoStub).to.have.been.calledOnceWithExactly({
        device_make_id: 1,
        model: null,
        survey_id: 1,
        serial: 'serial',
        comment: 'comment'
      });

      expect(device).to.be.equal(true);
    });
  });

  describe('updateDevice', () => {
    it('should update a device by its ID', async () => {
      const mockConnection = getMockDBConnection();
      const service = new TelemetryDeviceService(mockConnection);

      const repoStub = sinon.stub(TelemetryDeviceRepository.prototype, 'updateDevice').resolves(true as any);

      const device = await service.updateDevice(1, 2, {
        device_make_id: 1,
        serial: 'serial',
        comment: 'comment'
      });

      expect(repoStub).to.have.been.calledOnceWithExactly(1, 2, {
        device_make_id: 1,
        serial: 'serial',
        comment: 'comment'
      });

      expect(device).to.be.equal(true);
    });
  });
});
