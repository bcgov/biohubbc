import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useObservationApi from './useObservationApi';

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

  it('uploadObservationSubmission works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`).reply(200, 'OK');

    const result = await useObservationApi(axios).uploadObservationSubmission(projectId, surveyId, file);

    expect(result).toEqual('OK');
  });
});
