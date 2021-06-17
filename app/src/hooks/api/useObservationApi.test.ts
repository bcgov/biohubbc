import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from './useObservationApi';
import { ICreateBlockObservationPostRequest } from 'interfaces/useObservationApi.interface';

describe('useObservationApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 2;

  it('getObservationsList works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/observations/list`).reply(200, {
      blocks: [
        {
          id: 1,
          block_id: 20,
          number_of_observations: 10,
          start_time: '1:00',
          end_time: '2:00'
        },
        {
          id: 2,
          block_id: 20,
          number_of_observations: 10,
          start_time: '2:00',
          end_time: '3:00'
        }
      ]
    });

    const result = await useObservationApi(axios).getObservationsList(projectId, surveyId);

    expect(result.blocks[0].id).toEqual(1);
    expect(result.blocks[1].id).toEqual(2);
  });

  it('createBlockObservation as expected', async () => {
    const observation = {
      metaData: {
        block_name: 1,
        block_size: 1,
        strata: 'c',
        date: 'd',
        start_time: 'e',
        end_time: 'f',
        pilot_name: 'g',
        navigator: 'h',
        rear_left_observer: 'i',
        rear_right_observer: 'j',
        visibility: 'k',
        light: 'l',
        cloud_cover: 1,
        temperature: 1,
        precipitation: 'o',
        wind_speed: 1,
        snow_cover: 10,
        snow_depth: 10,
        days_since_snowfall: 7,
        weather_description: 't',
        description_of_habitat: 'u',
        aircraft_company: 'v',
        aircraft_type: 'w',
        aircraft_registration_number: 123,
        aircraft_gps_model: 'y',
        aircraft_gps_datum: 'z',
        aircraft_gps_readout: 'zz'
      },
      tableData: { data: [['1', '2']] }
    };

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/create`).reply(200, {
      id: 1
    });

    const result = await useObservationApi(axios).createBlockObservation(projectId, surveyId, observation);

    expect(result.id).toEqual(1);
  });
});
