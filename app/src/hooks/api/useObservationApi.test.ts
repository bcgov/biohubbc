import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from './useObservationApi';
import { getObservationForCreateUpdateResponse } from 'test-helpers/observation-helpers';

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
  const observationId = 2;

  const observation = {
    observation_type: 'block',
    observation_details_data: {
      block_name: 1,
      start_datetime: '2020/04/04',
      end_datetime: '2020/05/05',
      observation_count: 50,
      observation_data: {
        ...getObservationForCreateUpdateResponse.data
      },
      revision_count: getObservationForCreateUpdateResponse.revision_count
    }
  };

  it('getObservationForUpdate works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/observations/${observationId}/update`).reply(200, {
      id: 2,
      data: {
        metaData: {
          block_name: 11,
          block_size: 12
        },
        tableData: {
          data: [['1'], ['2']]
        }
      },
      revision_count: 1
    });

    const result = await useObservationApi(axios).getObservationForUpdate(projectId, surveyId, observationId, 'block');

    expect(result.id).toEqual(2);
  });

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

  it('updateObservation works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/survey/${surveyId}/observations/${observationId}/update`).reply(200, true);

    const result = await useObservationApi(axios).updateObservation(projectId, surveyId, observationId, observation);

    expect(result).toEqual(true);
  });

  it('createBlockObservation as expected', async () => {
    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observations/create`).reply(200, {
      id: 1
    });

    const result = await useObservationApi(axios).createObservation(projectId, surveyId, observation);

    expect(result.id).toEqual(1);
  });
});
