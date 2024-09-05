import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IObservationCountByGroup } from 'interfaces/useAnalyticsApi.interface';
import useAnalyticsApi from './useAnalyticsApi';

describe('useAnalyticsApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getObservationCountByGroup works as expected', async () => {
    const response: IObservationCountByGroup[] = [
      {
        id: '123-456-789',
        row_count: 10,
        individual_count: 40,
        individual_percentage: 1,
        itis_tsn: 123456,
        observation_date: '2021-01-01',
        survey_sample_site_id: 1,
        survey_sample_method_id: 2,
        survey_sample_period_id: 3,
        qualitative_measurements: [
          {
            taxon_measurement_id: '66',
            measurement_name: 'a',
            option: {
              option_id: '1',
              option_label: 'x'
            }
          }
        ],
        quantitative_measurements: [
          {
            taxon_measurement_id: '77',
            measurement_name: 'b',
            value: 1
          }
        ]
      }
    ];

    mock.onGet('/api/analytics/observations').reply(200, response);

    const surveyIds = [1, 2];
    const groupByColumns = ['a', 'b'];
    const groupByQuantitativeMeasurements = ['c', 'd'];
    const groupByQualitativeMeasurements = ['e', 'f'];

    const result = await useAnalyticsApi(axios).getObservationCountByGroup(
      surveyIds,
      groupByColumns,
      groupByQuantitativeMeasurements,
      groupByQualitativeMeasurements
    );

    expect(result).toEqual(response);
  });
});
