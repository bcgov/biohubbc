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

  describe('getCodeValues', () => {
    it('should return a list of code values', async () => {
      const mockCodeValues = {
        code_header_title: 'code_header_title',
        code_header_name: 'code_header_name',
        id: 123,
        description: 'description',
        long_description: 'long_description'
      };

      mock.onGet('/api/telemetry/code?codeHeader=code_header_name').reply(200, [mockCodeValues]);
      const result = await useTelemetryApi(axios).getCodeValues('code_header_name');
      expect(result).toEqual([mockCodeValues]);
    });

    it('should catch errors', async () => {
      mock.onGet('/api/telemetry/code?codeHeader=code_header_name').reply(500, 'error');
      const result = await useTelemetryApi(axios).getCodeValues('code_header_name');
      expect(result).toEqual([]);
    });
  });

  describe('uploadTelemetryDeviceCredentialFile', () => {
    it('should upload a keyx file', async () => {
      const projectId = 1;
      const surveyId = 2;

      const file = new File([''], 'file.keyx', { type: 'application/keyx' });
      const response = {
        attachmentId: 'attachment',
        revision_count: 1
      };
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/attachments/keyx/upload`).reply(201, response);

      const result = await useTelemetryApi(axios).uploadTelemetryDeviceCredentialFile(projectId, surveyId, file);
      expect(result).toEqual(response);
    });
  });
});
