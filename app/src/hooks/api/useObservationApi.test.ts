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
          survey_sample_period_id: 3,
          count: 40,
          observation_date: '2021-01-01',
          observation_time: '12:00:00',
          latitude: 49.456,
          longitude: -123.456,
          observation_sign_id: 1,
          survey_sample_site_id: 4,
          survey_sample_site_name: 'site name',
          method_technique_id: 5,
          method_technique_name: 'method name',
          survey_sample_period_start_datetime: '2021-01-01 12:00:00',
          qualitative_environments: [],
          quantitative_environments: [],
          subcounts: []
        }
      ],
      supplementaryObservationData: {
        observationCount: 100,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: [],
        sampling_data: []
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

  describe('importObservationCSV', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const file = new File([''], 'file.txt', { type: 'application/plain' });

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/import`).reply(200, undefined);

      const result = await useObservationApi(axios).importObservationCSV({
        projectId,
        surveyId,
        file
      });

      expect(result).toEqual(undefined);
    });
  });

  describe('deleteObservationRecords', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const observationIds = [3, 4];

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/delete`).reply(200, undefined);

      const result = await useObservationApi(axios).deleteObservationRecords(projectId, surveyId, observationIds);

      expect(result).toEqual(undefined);
    });
  });

  describe('deleteRows', () => {
    it('works as expected', async () => {
      const projectId = 1;
      const surveyId = 2;
      const observationSubcountIds = [3, 4];

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/subcounts/delete`).reply(200, undefined);

      const result = await useObservationApi(axios).deleteRows(projectId, surveyId, observationSubcountIds);

      expect(result).toEqual(undefined);
    });
  });
});
