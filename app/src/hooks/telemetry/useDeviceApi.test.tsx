import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Device } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useDeviceApi } from './useDeviceApi';

describe('useDeviceApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const mockVendors = ['vendor1', 'vendor2'];

  const mockCodeValues = {
    code_header_title: 'code_header_title',
    code_header_name: 'code_header_name',
    id: 123,
    description: 'description',
    long_description: 'long_description'
  };

  describe('getCollarVendors', () => {
    it('should return a list of vendors', async () => {
      mock.onGet('/api/telemetry/vendors').reply(200, mockVendors);
      const result = await useDeviceApi(axios).getCollarVendors();
      expect(result).toEqual(mockVendors);
    });

    it('should catch errors', async () => {
      mock.onGet('/api/telemetry/vendors').reply(500, 'error');
      const result = await useDeviceApi(axios).getCollarVendors();
      expect(result).toEqual([]);
    });
  });

  describe('getCodeValues', () => {
    it('should return a list of code values', async () => {
      mock.onGet('/api/telemetry/code?codeHeader=code_header_name').reply(200, [mockCodeValues]);
      const result = await useDeviceApi(axios).getCodeValues('code_header_name');
      expect(result).toEqual([mockCodeValues]);
    });

    it('should catch errors', async () => {
      mock.onGet('/api/telemetry/code?codeHeader=code_header_name').reply(500, 'error');
      const result = await useDeviceApi(axios).getCodeValues('code_header_name');
      expect(result).toEqual([]);
    });
  });

  describe('getDeviceDetails', () => {
    it('should return device deployment details', async () => {
      mock.onGet(`/api/telemetry/device/${123}`).reply(200, { device: undefined, deployments: [] });
      const result = await useDeviceApi(axios).getDeviceDetails(123, 'Vectronic');
      expect(result.deployments.length).toBe(0);
    });

    it('should catch errors', async () => {
      mock.onGet(`/api/telemetry/device/${123}`).reply(500, 'error');
      const result = await useDeviceApi(axios).getDeviceDetails(123, 'Vectronic');
      expect(result.deployments.length).toBe(0);
      expect(result.device).toBeUndefined();
      expect(result.keyXStatus).toBe(false);
    });
  });

  describe('upsertCollar', () => {
    it('should upsert a collar', async () => {
      const device = new Device({ device_id: 123, collar_id: 'abc' });
      mock.onPost(`/api/telemetry/device`).reply(200, { device_id: 123, collar_id: 'abc' });
      const result = await useDeviceApi(axios).upsertCollar(device);
      expect(result.device_id).toBe(123);
    });

    it('should catch errors', async () => {
      const device = new Device({ device_id: 123, collar_id: 'abc' });
      mock.onPost(`/api/telemetry/device`).reply(500, 'error');
      const result = await useDeviceApi(axios).upsertCollar(device);
      expect(result).toEqual({});
    });
  });
});
