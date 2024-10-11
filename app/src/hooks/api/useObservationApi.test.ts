import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from 'hooks/api/useObservationApi';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';

describe('useObservationApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('findObservations works as expected', async () => {
    const mockResponse: IGetSurveyObservationsResponse = {
      surveyObservations: [
        {
          survey_observation_id: 1,
          itis_tsn: 12345,
          itis_scientific_name: 'scientific name',
          survey_sample_site_id: 1,
          survey_sample_method_id: 2,
          survey_sample_period_id: 3,
          count: 40,
          observation_date: '2021-01-01',
          observation_time: '12:00:00',
          latitude: 49.456,
          longitude: -123.456,
          survey_sample_site_name: 'site name',
          survey_sample_method_name: 'method name',
          survey_sample_period_start_datetime: '2021-01-01 12:00:00',
          subcounts: []
        }
      ],
      supplementaryObservationData: {
        observationCount: 100,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: [],
        sample_sites: []
      },
      pagination: {
        total: 100,
        current_page: 2,
        last_page: 4,
        per_page: 25
      }
    };

    mock.onGet('/api/observation', { params: { limit: 25, page: 2, keyword: 'moose' } }).reply(200, mockResponse);

    const result = await useObservationApi(axios).findObservations({ limit: 25, page: 2 }, { keyword: 'moose' });

    expect(result).toEqual(mockResponse);
  });

  describe('uploadCsvForImport', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const file = new File([''], 'file.txt', { type: 'application/plain' });

      const res = {
        submissionId: 1
      };

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/upload`).reply(200, res);

      const result = await useObservationApi(axios).uploadCsvForImport(projectId, surveyId, file);

      expect(result).toEqual(res);
    });
  });

  describe('processCsvSubmission', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const submissionId = 3;

      const res = undefined;

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/process`).reply(200, res);

      const result = await useObservationApi(axios).processCsvSubmission(projectId, surveyId, submissionId);

      expect(result).toEqual(res);
    });

    it('works as expected with options', async () => {
      const projectId = 1;
      const surveyId = 2;
      const submissionId = 3;
      const options = {
        surveySamplePeriodId: 4
      };

      const res = undefined;

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/process`).reply(200, res);

      const result = await useObservationApi(axios).processCsvSubmission(projectId, surveyId, submissionId, options);

      expect(result).toEqual(res);
    });
  });
});
