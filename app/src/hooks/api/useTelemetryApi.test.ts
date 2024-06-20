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
          animal: {
            critter_id: '123',
            wlh_id: '5678',
            animal_id: '987978',
            sex: 'female',
            itis_tsn: 117233,
            itis_scientific_name: 'scientific name',
            responsible_region_nr_id: null,
            critter_comment: null
          },
          telemetry: [
            {
              id: '1',
              telemetry_id: 2,
              telemetry_type: 'manual',
              telemetry_manual_id: '777',
              deployment_id: '222',
              latitude: 49.123,
              longitude: -126.123,
              acquisition_date: '2021-01-01'
            }
          ]
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
