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

  it('getSubmissionCSVForView works as expected', async () => {
    const submissionId = 2;
    const data = [
      {
        name: 'name 1',
        headers: ['header 1', 'header 2'],
        rows: [
          ['row 1', 'row 1 again'],
          ['row 2', 'row 2 again']
        ]
      }
    ];

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/view`)
      .reply(200, { data });

    const result = await useObservationApi(axios).getSubmissionCSVForView(projectId, surveyId, submissionId);

    expect(result.data[0].name).toEqual('name 1');
  });
});
