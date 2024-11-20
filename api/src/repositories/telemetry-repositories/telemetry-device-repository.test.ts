import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryDeviceRepository } from './telemetry-device-repository';

chai.use(sinonChai);

describe('TelemetryDeviceRepository', () => {
  it('should construct', () => {
    const mockDBConnection = getMockDBConnection();
    const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

    expect(telemetryDeviceRepository).to.be.instanceof(TelemetryDeviceRepository);
  });

  describe('getDevicesByIds', () => {
    it('should get devices by IDs', async () => {
      const mockRows = [{ device_id: 1 }];
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: mockRows }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      const response = await telemetryDeviceRepository.getDevicesByIds(1, [1]);
      expect(response).to.eql(mockRows);
    });
  });

  describe('deleteDevicesByIds', () => {
    it('should delete devices by IDs', async () => {
      const mockRows = [{ device_id: 1 }];
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: mockRows }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      const response = await telemetryDeviceRepository.deleteDevicesByIds(1, [1]);
      expect(response).to.eql(mockRows);
    });
  });

  describe('createDevice', () => {
    it('should create a new device', async () => {
      const mockRows = [{ device_id: 1 }];
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: mockRows, rowCount: 1 }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      const response = await telemetryDeviceRepository.createDevice({ device_id: 1 } as any);
      expect(response).to.eql({ device_id: 1 });
    });

    it('should throw an error if unable to create a new device', async () => {
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: [], rowCount: 0 }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      try {
        await telemetryDeviceRepository.createDevice({ device_id: 1 } as any);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Device was not created');
      }
    });
  });

  describe('updateDevice', () => {
    it('should update an existing device', async () => {
      const mockRows = [{ device_id: 1 }];
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: mockRows, rowCount: 1 }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      const response = await telemetryDeviceRepository.updateDevice(1, 2, { comment: 1 } as any);
      expect(response).to.eql({ device_id: 1 });
    });
    it('should throw an error if unable to update an existing device', async () => {
      const mockDBConnection = getMockDBConnection({ knex: sinon.stub().resolves({ rows: [], rowCount: 0 }) });

      const telemetryDeviceRepository = new TelemetryDeviceRepository(mockDBConnection);

      try {
        await telemetryDeviceRepository.updateDevice(1, 2, { comment: 1 } as any);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.equal('Device was not updated');
      }
    });
  });
});
