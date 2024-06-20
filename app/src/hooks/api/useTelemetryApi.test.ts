import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useTelemetryApi from 'hooks/api/useTelemetryApi';
import { IFindTelemetryResponse } from 'interfaces/useTelemetryApi.interface';

describe('useTelemetryApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('findTelemetry works as expected', async () => {
    const mockResponse: IFindTelemetryResponse = {
      telemetry: [
        {
          telemetry_id: '123',
          acquisition_date: '2021-01-01',
          latitude: 49.123,
          longitude: -126.123,
          telemetry_type: 'vendor',
          device_id: 12345,
          bctw_deployment_id: '123-123-123',
          critter_id: 2,
          deployment_id: 3,
          critterbase_critter_id: '345-345-345-',
          animal_id: '567234-234'
        }
      ],
      pagination: {
        total: 100,
        current_page: 2,
        last_page: 4,
        per_page: 25
      }
    };

    mock.onGet('/api/telemetry', { params: { limit: 25, page: 2, itis_tsn: 12345 } }).reply(200, mockResponse);

    const result = await useTelemetryApi(axios).findTelemetry({ limit: 25, page: 2 }, { itis_tsn: 12345 });

    expect(result).toEqual(mockResponse);
  });
});
