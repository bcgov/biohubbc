import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from './useObservationApi';
import { getObservationForUpdateResponse } from 'test-helpers/observation-helpers';

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
    const observation = getObservationForUpdateResponse.data;

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/create`).reply(200, {
      id: 1
    });

    const result = await useObservationApi(axios).createObservation(projectId, surveyId, observation);

    expect(result.id).toEqual(1);
  });
});
